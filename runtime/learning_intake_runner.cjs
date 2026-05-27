const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const ROOT = "/Users/macbook/ultron";
const DEFAULT_PAYLOAD_PATH = path.join(ROOT, "runtime", "learning_intake_test_payload.json");
const CONFIG_PATH = path.join(ROOT, "runtime", "learning_config.json");
const MEMORY_ROOT = path.join(ROOT, "memory");

const WATCHED_MEMORY_PATHS = [
  path.join(MEMORY_ROOT, "raw_input"),
  path.join(MEMORY_ROOT, "classified"),
  path.join(MEMORY_ROOT, "distilled_knowledge"),
  path.join(MEMORY_ROOT, "tasks"),
  path.join(MEMORY_ROOT, "learning_atoms.json"),
  path.join(MEMORY_ROOT, "knowledge_index.json")
];

const BLOCKERS = [
  { name: ".env reference", pattern: /(^|[/\s])\.env(\b|[/\s])/i },
  { name: "api key", pattern: /\b(api[_-]?key|OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY)\b/i },
  { name: "credential", pattern: /\b(token|secret|password|private[_-]?key)\b\s*[:=]/i },
  { name: "private key", pattern: /-----BEGIN [^-]+ PRIVATE KEY-----/i },
  { name: "banking data", pattern: /\b(iban|swift|routing number|bank account|cuenta bancaria|tarjeta|credit card)\b/i },
  { name: "card-like number", pattern: /\b(?:\d[ -]*?){13,19}\b/ }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolvePayloadPath(argv) {
  const payloadFlagIndex = argv.indexOf("--payload");
  const requestedPath = payloadFlagIndex >= 0 ? argv[payloadFlagIndex + 1] : DEFAULT_PAYLOAD_PATH;

  if (!requestedPath) {
    throw new Error("Missing value for --payload.");
  }

  return path.isAbsolute(requestedPath) ? requestedPath : path.join(ROOT, requestedPath);
}

function parseOptions(argv) {
  return {
    payloadPath: resolvePayloadPath(argv),
    dryRun: argv.includes("--dry-run")
  };
}

function assertInsideRoot(targetPath) {
  const resolved = path.resolve(targetPath);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Path outside ULTRON root is not allowed: ${targetPath}`);
  }
  return resolved;
}

function scanForBlockers(payload) {
  const haystack = [
    payload.project,
    payload.source_type,
    payload.topic,
    payload.text
  ].join("\n");

  return BLOCKERS.filter((blocker) => blocker.pattern.test(haystack)).map((blocker) => blocker.name);
}

function isReuseAllowed(category, config) {
  const policy = config.reuse_policy && config.reuse_policy[category];
  if (!policy) return false;
  return !String(policy).startsWith("DO_NOT_REUSE");
}

async function collectFiles(targetPath) {
  const resolved = assertInsideRoot(targetPath);
  const stat = await fsp.stat(resolved).catch(() => null);
  if (!stat) return [];
  if (stat.isFile()) return [resolved];

  const entries = await fsp.readdir(resolved, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => collectFiles(path.join(resolved, entry.name))));
  return nested.flat();
}

async function snapshotMemory() {
  const files = (await Promise.all(WATCHED_MEMORY_PATHS.map(collectFiles))).flat();
  const pairs = await Promise.all(files.map(async (filePath) => {
    const stat = await fsp.stat(filePath);
    return [filePath, stat.mtimeMs];
  }));
  return new Map(pairs);
}

async function changedSince(before) {
  const after = await snapshotMemory();
  return [...after.entries()]
    .filter(([filePath, mtime]) => !before.has(filePath) || before.get(filePath) !== mtime)
    .map(([filePath]) => path.relative(ROOT, filePath))
    .sort();
}

async function blockedResult({ reason, detail, before, classification }) {
  const updatedFiles = before ? await changedSince(before) : [];
  console.log(JSON.stringify({
    write_result: "BLOCKED",
    reason,
    detail,
    classification: classification && classification.category,
    risk_level: classification && classification.risk_level,
    files_updated: updatedFiles,
    final_status: "ULTRON_LEARNING_INTAKE_NEGATIVE_TEST_OK"
  }, null, 2));
}

async function loadLearningModules() {
  const moduleBase = path.join(ROOT, "app", "src", "lib");
  const classifier = await import(pathToFileURL(path.join(moduleBase, "sensitivityClassifier.js")).href);
  const distiller = await import(pathToFileURL(path.join(moduleBase, "knowledgeDistiller.js")).href);
  const writer = await import(pathToFileURL(path.join(moduleBase, "memoryWriter.js")).href);
  const reader = await import(pathToFileURL(path.join(moduleBase, "memoryReader.js")).href);
  return { classifier, distiller, writer, reader };
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const payloadPath = options.payloadPath;
  assertInsideRoot(payloadPath);
  assertInsideRoot(CONFIG_PATH);

  const before = await snapshotMemory();
  const payload = readJson(payloadPath);
  const config = readJson(CONFIG_PATH);

  if (payload.contains_real_data !== false) {
    await blockedResult({
      reason: "REAL_DATA_NOT_ALLOWED",
      detail: "Payload must be simulated and contains_real_data must be false.",
      before
    });
    return;
  }

  if (!payload.text || typeof payload.text !== "string") {
    throw new Error("Learning intake blocked: payload.text is required.");
  }

  const blockers = scanForBlockers(payload);
  if (blockers.length > 0) {
    await blockedResult({
      reason: payload.approval_simulated === true ? "BLOCKED_PATTERN_DETECTED" : "SENSITIVE_CONTENT_WITHOUT_APPROVAL",
      detail: `${blockers.join(", ")} detected.`,
      before
    });
    return;
  }

  const { classifier, distiller, writer, reader } = await loadLearningModules();
  const classification = classifier.classifySensitivity(payload.text);

  if (!classification.category) {
    throw new Error("Learning intake blocked: classification category missing.");
  }

  if (classification.category === "CONFIDENTIAL" && payload.approval_simulated !== true) {
    await blockedResult({
      reason: "SENSITIVE_CONTENT_WITHOUT_APPROVAL",
      detail: "CONFIDENTIAL content requires simulated human approval.",
      before,
      classification
    });
    return;
  }

  if (classification.requires_human_approval && payload.approval_simulated !== true) {
    await blockedResult({
      reason: "SENSITIVE_CONTENT_WITHOUT_APPROVAL",
      detail: "Sensitive content requires simulated human approval.",
      before,
      classification
    });
    return;
  }

  if (!isReuseAllowed(classification.category, config)) {
    await blockedResult({
      reason: "REUSE_POLICY_BLOCKED",
      detail: `Reuse policy does not allow storing ${classification.category}.`,
      before,
      classification
    });
    return;
  }

  const distilled = distiller.distillKnowledge(payload.text, {
    project: payload.project,
    topic: payload.topic,
    source: payload.source_type,
    classification
  });

  if (!Array.isArray(distilled.atoms) || distilled.atoms.length === 0) {
    throw new Error("Learning intake blocked: no knowledge atoms generated.");
  }

  if (options.dryRun) {
    const updatedFiles = await changedSince(before);
    console.log(JSON.stringify({
      classification: classification.category,
      risk_level: classification.risk_level,
      learnings: distilled.distilled.learnings.length,
      tasks: distilled.distilled.tasks.length,
      risks: distilled.distilled.risks.length,
      atoms_generated: distilled.atoms.length,
      atoms_read_back: 0,
      files_updated: updatedFiles,
      write_result: "PASS_SIMULATED",
      final_status: "ULTRON_LEARNING_INTAKE_V1_OK"
    }, null, 2));
    return;
  }

  const writeResult = await writer.writeLearningMemory(payload.text, {
    project: payload.project,
    topic: payload.topic,
    source: payload.source_type,
    classification
  });
  const updatedFiles = await changedSince(before);

  const matches = await reader.searchMemory({
    project: payload.project,
    topic: payload.topic
  });

  const verified = matches.some((atom) => distilled.atoms.some((candidate) => candidate.topic === atom.topic));
  if (!verified) {
    throw new Error("Learning intake failed verification: stored atom was not readable.");
  }

  const summary = {
    classification: classification.category,
    risk_level: classification.risk_level,
    learnings: distilled.distilled.learnings.length,
    tasks: distilled.distilled.tasks.length,
    risks: distilled.distilled.risks.length,
    atoms_generated: distilled.atoms.length,
    atoms_read_back: matches.length,
    files_updated: updatedFiles,
    write_result: writeResult.status,
    final_status: "ULTRON_LEARNING_INTAKE_V1_OK"
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    final_status: "ULTRON_LEARNING_INTAKE_V1_BLOCKED",
    error: error.message
  }, null, 2));
  process.exit(1);
});
