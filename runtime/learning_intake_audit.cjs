const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const ROOT = "/Users/macbook/ultron";
const RUNNER = path.join(ROOT, "runtime", "learning_intake_runner.cjs");
const NEGATIVE_PAYLOAD = path.join(ROOT, "runtime", "learning_intake_negative_payload.json");
const MEMORY_ROOT = path.join(ROOT, "memory");

const WATCHED_MEMORY_PATHS = [
  path.join(MEMORY_ROOT, "raw_input"),
  path.join(MEMORY_ROOT, "classified"),
  path.join(MEMORY_ROOT, "distilled_knowledge"),
  path.join(MEMORY_ROOT, "tasks"),
  path.join(MEMORY_ROOT, "learning_atoms.json"),
  path.join(MEMORY_ROOT, "knowledge_index.json")
];

function assertInsideRoot(targetPath) {
  const resolved = path.resolve(targetPath);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Path outside ULTRON root is not allowed: ${targetPath}`);
  }
  return resolved;
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
    return [filePath, `${stat.size}:${stat.mtimeMs}`];
  }));
  return new Map(pairs);
}

async function changedSince(before) {
  const after = await snapshotMemory();
  return [...after.entries()]
    .filter(([filePath, signature]) => !before.has(filePath) || before.get(filePath) !== signature)
    .map(([filePath]) => path.relative(ROOT, filePath))
    .sort();
}

function runJson(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: "utf8"
  });

  const output = (result.stdout || result.stderr || "").trim();
  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    throw new Error(`Runner did not return JSON. Exit ${result.status}. Output: ${output}`);
  }

  if (result.status !== 0) {
    throw new Error(`Runner exited ${result.status}: ${JSON.stringify(parsed)}`);
  }

  return parsed;
}

function assertPositive(result) {
  if (!result.classification) throw new Error("Positive test failed: classification missing.");
  if (Number(result.atoms_generated) < 1) throw new Error("Positive test failed: no atoms generated.");
  if (!["WRITTEN", "PASS_SIMULATED"].includes(result.write_result)) {
    throw new Error(`Positive test failed: unexpected write_result ${result.write_result}.`);
  }
  if (result.final_status !== "ULTRON_LEARNING_INTAKE_V1_OK") {
    throw new Error(`Positive test failed: unexpected final_status ${result.final_status}.`);
  }
}

function assertNegative(result) {
  if (result.write_result !== "BLOCKED") throw new Error("Negative test failed: write_result was not BLOCKED.");
  if (!String(result.reason || "").includes("SENSITIVE_CONTENT_WITHOUT_APPROVAL")) {
    throw new Error(`Negative test failed: unexpected reason ${result.reason}.`);
  }
  if (!Array.isArray(result.files_updated) || result.files_updated.length !== 0) {
    throw new Error("Negative test failed: files_updated was not empty.");
  }
  if (result.final_status !== "ULTRON_LEARNING_INTAKE_NEGATIVE_TEST_OK") {
    throw new Error(`Negative test failed: unexpected final_status ${result.final_status}.`);
  }
}

async function main() {
  if (!fs.existsSync(RUNNER)) throw new Error("Learning intake runner is missing.");
  if (!fs.existsSync(NEGATIVE_PAYLOAD)) throw new Error("Negative payload is missing.");

  const before = await snapshotMemory();
  const positive = runJson([RUNNER, "--dry-run"]);
  assertPositive(positive);

  const afterPositive = await changedSince(before);
  if (afterPositive.length > 0) {
    throw new Error(`Positive dry-run polluted memory: ${afterPositive.join(", ")}`);
  }

  const negative = runJson([RUNNER, "--payload", NEGATIVE_PAYLOAD]);
  assertNegative(negative);

  const afterAll = await changedSince(before);
  if (afterAll.length > 0) {
    throw new Error(`Audit polluted memory: ${afterAll.join(", ")}`);
  }

  console.log(JSON.stringify({
    positive_test: "PASS",
    positive_write_result: positive.write_result,
    negative_test: "PASS",
    negative_write_result: negative.write_result,
    memory_pollution: "NO",
    build_required: true,
    final_status: "ULTRON_LEARNING_INTAKE_AUDIT_V1_PASS"
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    positive_test: "UNKNOWN",
    negative_test: "UNKNOWN",
    memory_pollution: "UNKNOWN",
    build_required: true,
    final_status: "ULTRON_LEARNING_INTAKE_AUDIT_V1_FAIL",
    error: error.message
  }, null, 2));
  process.exit(1);
});

