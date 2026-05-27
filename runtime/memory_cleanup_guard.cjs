const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const ROOT = "/Users/macbook/ultron";
const apply = process.argv.includes("--apply");

const MEMORY_DIRS = [
  "memory/raw_input",
  "memory/classified",
  "memory/distilled_knowledge",
  "memory/tasks"
];

const RUNTIME_LOCAL_FILES = [
  "runtime/session_state.json",
  "runtime/ultron.db",
  "runtime/ultron.db-shm",
  "runtime/ultron.db-wal"
];

const LOCAL_PATHS = [
  "workspace/ideas",
  "install_mobile.js"
];

const NEVER_DELETE = new Set([
  "memory/learning_atoms.json",
  "memory/knowledge_index.json"
]);

const SUSPICIOUS_PATTERNS = [
  { name: ".env", pattern: /(^|[/\s])\.env(\b|[/\s])/i },
  { name: "API_KEY", pattern: /\b[A-Z0-9_]*API_KEY\b|api[_-]?key/i },
  { name: "SECRET", pattern: /\bSECRET\b|secret\s*[:=]/i },
  { name: "TOKEN", pattern: /\bTOKEN\b|token\s*[:=]/i },
  { name: "PASSWORD", pattern: /\bPASSWORD\b|password\s*[:=]/i }
];

function toRelative(targetPath) {
  return path.relative(ROOT, targetPath);
}

function resolveInsideRoot(relativePath) {
  const resolved = path.resolve(ROOT, relativePath);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Blocked path outside root: ${relativePath}`);
  }
  return resolved;
}

async function exists(relativePath) {
  return fsp.stat(resolveInsideRoot(relativePath)).then(() => true).catch(() => false);
}

async function walk(relativePath) {
  const resolved = resolveInsideRoot(relativePath);
  const stat = await fsp.stat(resolved).catch(() => null);
  if (!stat) return [];
  if (stat.isFile()) return [resolved];

  const entries = await fsp.readdir(resolved, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => walk(path.join(relativePath, entry.name))));
  return nested.flat();
}

function isUltronTestOutput(relativePath) {
  return relativePath.startsWith("memory/") && relativePath.includes("ULTRON_TEST") && !relativePath.endsWith(".gitkeep");
}

function isRawGenerated(relativePath) {
  return relativePath.startsWith("memory/raw_input/") && !relativePath.endsWith(".gitkeep");
}

async function scanMemoryOutputs() {
  const files = (await Promise.all(MEMORY_DIRS.map(walk))).flat().map(toRelative).sort();
  return {
    timestamp_outputs: files.filter((file) => /\/\d{4}-\d{2}-\d{2}T/.test(file)),
    raw_input_generated: files.filter(isRawGenerated),
    safe_test_outputs: files.filter(isUltronTestOutput)
  };
}

async function scanLocalRuntime() {
  return {
    runtime_databases: (await Promise.all(RUNTIME_LOCAL_FILES.filter((file) => file.includes("ultron.db")).map(async (file) => (await exists(file)) ? file : null))).filter(Boolean),
    session_state: (await exists("runtime/session_state.json")) ? ["runtime/session_state.json"] : [],
    workspace_ideas: (await exists("workspace/ideas")) ? ["workspace/ideas/"] : [],
    install_mobile: (await exists("install_mobile.js")) ? ["install_mobile.js"] : []
  };
}

async function scanSuspiciousFiles() {
  const scanRoots = ["memory", "runtime", "docs", "app/src/lib"];
  const files = (await Promise.all(scanRoots.map(walk))).flat();
  const findings = [];

  for (const filePath of files) {
    const relative = toRelative(filePath);
    if (relative.endsWith(".gitkeep")) continue;
    if (NEVER_DELETE.has(relative)) continue;

    let text = "";
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const matches = SUSPICIOUS_PATTERNS
      .filter((item) => item.pattern.test(relative) || item.pattern.test(text))
      .map((item) => item.name);

    if (matches.length > 0) {
      findings.push({ file: relative, matches });
    }
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file));
}

async function applyCleanup(files) {
  const deleted = [];

  for (const relativePath of files) {
    if (!isUltronTestOutput(relativePath)) continue;
    if (relativePath.endsWith(".gitkeep")) continue;
    if (NEVER_DELETE.has(relativePath)) continue;

    await fsp.unlink(resolveInsideRoot(relativePath));
    deleted.push(relativePath);
  }

  return deleted;
}

async function main() {
  const memory = await scanMemoryOutputs();
  const runtime = await scanLocalRuntime();
  const suspicious_files = await scanSuspiciousFiles();
  const deleted = apply ? await applyCleanup(memory.safe_test_outputs) : [];

  console.log(JSON.stringify({
    mode: apply ? "APPLY" : "REPORT_ONLY",
    timestamp_outputs_found: memory.timestamp_outputs,
    raw_input_generated_found: memory.raw_input_generated,
    runtime_databases_found: runtime.runtime_databases,
    session_state_found: runtime.session_state,
    workspace_ideas_found: runtime.workspace_ideas,
    install_mobile_found: runtime.install_mobile,
    suspicious_files,
    safe_test_outputs_found: memory.safe_test_outputs,
    deleted,
    final_status: apply ? "MEMORY_CLEANUP_APPLY_OK" : "MEMORY_CLEANUP_REPORT_OK"
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    final_status: "MEMORY_CLEANUP_GUARD_FAILED",
    error: error.message
  }, null, 2));
  process.exit(1);
});

