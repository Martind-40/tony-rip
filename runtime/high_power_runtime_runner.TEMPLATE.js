const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = "/Users/macbook/ultron";
const POLICY_PATH = path.join(PROJECT_ROOT, "runtime", "high_power_controlled_policy.json");
const MATRIX_PATH = path.join(PROJECT_ROOT, "runtime", "high_power_command_matrix.json");

// TEMPLATE ONLY.
// REAL EXECUTION IS DISABLED.
// DO NOT ENABLE COMMAND EXECUTION WITHOUT CHIEF APPROVAL.

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadHighPowerPolicy() {
  return loadJson(POLICY_PATH);
}

function loadHighPowerMatrix() {
  return loadJson(MATRIX_PATH);
}

function assertProjectScope(workingDirectory) {
  const resolved = path.resolve(workingDirectory);
  return resolved === PROJECT_ROOT || resolved.startsWith(`${PROJECT_ROOT}${path.sep}`);
}

function containsSecretTarget(command) {
  return /\.(env|pem)$|\.ssh|id_rsa|id_ed25519|private_key|api_key|apikey|token|secret|credential/i.test(
    command
  );
}

function containsExternalPath(command) {
  return /\/Users\/macbook\/(?!ultron\b)|\.\.\//i.test(command);
}

function containsDestructiveCommand(command) {
  return /sudo|rm\s+-rf|chmod|chown|git\s+reset\s+--hard/i.test(command);
}

function containsNetworkCommand(command) {
  return /curl|wget|ssh|scp|rsync|https?:\/\//i.test(command);
}

function requiresDoubleConfirmation(command) {
  return /git\s+add|git\s+commit|runtime_config\.json|runtime_policy_guard\.js|DRY_RUN_ONLY/i.test(
    command
  );
}

function validateHighPowerRequest(request) {
  const policy = loadHighPowerPolicy();
  const matrix = loadHighPowerMatrix();
  const command = String(request.command || "");
  const workingDirectory = request.workingDirectory || PROJECT_ROOT;

  if (policy.real_execution_enabled !== false) {
    return { status: "BLOCKED", reason: "Real execution must remain disabled." };
  }

  if (!assertProjectScope(workingDirectory) || containsExternalPath(command)) {
    return { status: "BLOCKED_EXTERNAL_PATH", reason: "Outside project scope." };
  }

  if (containsSecretTarget(command)) {
    return { status: "BLOCKED_SECRET_ACCESS", reason: "Secret-like target blocked." };
  }

  if (containsDestructiveCommand(command)) {
    return { status: "BLOCKED_DESTRUCTIVE_COMMAND", reason: "Destructive command blocked." };
  }

  if (containsNetworkCommand(command)) {
    return { status: "BLOCKED_NETWORK", reason: "External network command blocked." };
  }

  if (!request.chiefApproval) {
    return { status: "CHIEF_APPROVAL_REQUIRED", reason: "Chief confirmation missing." };
  }

  if (requiresDoubleConfirmation(command) && !request.chiefDoubleApproval) {
    return {
      status: "CHIEF_DOUBLE_APPROVAL_REQUIRED",
      reason: "Sensitive action requires double confirmation."
    };
  }

  return {
    status: "TEMPLATE_VALIDATION_PASS",
    reason: "Request would be eligible for future controlled execution review.",
    matrixStatus: matrix.matrix_status
  };
}

function createPreExecutionLog(request, validation) {
  return {
    timestamp: new Date().toISOString(),
    phase: "PRE_EXECUTION_TEMPLATE",
    command: request.command,
    workingDirectory: request.workingDirectory || PROJECT_ROOT,
    validation,
    rollback: request.rollback || "Rollback plan required before real execution."
  };
}

function createPostExecutionLog(request, validation, output) {
  return {
    timestamp: new Date().toISOString(),
    phase: "POST_EXECUTION_TEMPLATE",
    command: request.command,
    validation,
    outputSummary: String(output || "").slice(0, 8000),
    filesChanged: [],
    rollbackHook: "Not active. Template only."
  };
}

function runHighPowerTemplate(request) {
  const validation = validateHighPowerRequest(request);
  const preLog = createPreExecutionLog(request, validation);

  // Real command execution would be reviewed here in a future approved mode.
  // This template intentionally returns without running terminal commands.

  const postLog = createPostExecutionLog(
    request,
    validation,
    "No command executed. HIGH_POWER template remains disabled."
  );

  return { validation, preLog, postLog };
}

module.exports = {
  loadHighPowerPolicy,
  loadHighPowerMatrix,
  validateHighPowerRequest,
  createPreExecutionLog,
  createPostExecutionLog,
  runHighPowerTemplate
};
