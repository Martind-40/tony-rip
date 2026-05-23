const fs = require("node:fs");
const path = require("node:path");
const {
  RUNTIME_STATES,
  hasBlockedKeyword,
  isExternalNetworkCommand,
  isProtectedPath,
  isSecretAccess,
  validateRuntimeCommand
} = require("./runtime_policy_guard");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const POLICY_PATH = path.join(PROJECT_ROOT, "core", "local_command_bridge.policy.json");
const ALLOWLIST_PATH = path.join(PROJECT_ROOT, "core", "safe_commands.allowlist.json");
const CONFIG_PATH = path.join(PROJECT_ROOT, "runtime", "runtime_config.json");

// REAL EXECUTION IS DISABLED.
// DRY RUN ONLY.
// PRIVATE MODE REQUIRED FOR FUTURE EXECUTION.
// CHIEF APPROVAL REQUIRED.

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadPolicy() {
  return readJson(POLICY_PATH);
}

function loadAllowlist() {
  return readJson(ALLOWLIST_PATH);
}

function loadRuntimeConfig() {
  return readJson(CONFIG_PATH);
}

function findAllowedCommand(commandId) {
  const allowlist = loadAllowlist();
  return allowlist.commands.find((command) => command.id === commandId);
}

function validateCommandRequest(commandId) {
  const policy = loadPolicy();
  const runtimeConfig = loadRuntimeConfig();
  const command = findAllowedCommand(commandId);
  return validateRuntimeCommand(command, policy, runtimeConfig);
}

function validateProtectedPaths(command) {
  const policy = loadPolicy();
  const blocked = isProtectedPath(command.working_directory, policy.protected_paths);
  return {
    status: blocked
      ? RUNTIME_STATES.BLOCKED_PROTECTED_PATH
      : RUNTIME_STATES.VALIDATION_PASS,
    blocked,
    reason: blocked
      ? "Protected path access blocked."
      : "Working directory is not protected."
  };
}

function validateBlockedCommand(command) {
  const blocked = hasBlockedKeyword(command.command);
  return {
    status: blocked
      ? RUNTIME_STATES.BLOCKED_BY_POLICY
      : RUNTIME_STATES.VALIDATION_PASS,
    blocked,
    reason: blocked
      ? "Command contains blocked runtime keyword."
      : "No blocked keyword detected."
  };
}

function validatePermissionLevel(command) {
  if (command.permission_level === "BLOCKED") {
    return {
      status: RUNTIME_STATES.BLOCKED_BY_POLICY,
      reason: "Permission level is BLOCKED."
    };
  }

  if (command.requires_chief_approval) {
    return {
      status: RUNTIME_STATES.APPROVAL_REQUIRED,
      reason: "Chief approval is required before real execution."
    };
  }

  return {
    status: RUNTIME_STATES.VALIDATION_PASS,
    reason: "Permission level is acceptable for DRY_RUN review."
  };
}

function simulateExecution(commandId) {
  const command = findAllowedCommand(commandId);
  const validation = validateCommandRequest(commandId);

  if (!command) {
    return {
      commandId,
      status: RUNTIME_STATES.VALIDATION_FAIL,
      risk: "HIGH",
      executed: false,
      output: "Command is not allowlisted. No command was executed."
    };
  }

  if (validation.status !== RUNTIME_STATES.VALIDATION_PASS) {
    return {
      commandId,
      command: command.command,
      status: validation.status,
      risk: validation.risk,
      executed: false,
      output: validation.reason
    };
  }

  return {
    commandId,
    command: command.command,
    status: RUNTIME_STATES.DRY_RUN_READY,
    risk: command.risk_level || "LOW",
    executed: false,
    output: "DRY_RUN simulation complete. No terminal command was executed."
  };
}

function createRuntimeResult(commandId) {
  const result = simulateExecution(commandId);
  const blockedSecret = isSecretAccess(result.command);
  const blockedNetwork = isExternalNetworkCommand(result.command);

  if (blockedSecret) {
    return {
      ...result,
      status: RUNTIME_STATES.BLOCKED_SECRET_ACCESS,
      risk: "HIGH",
      output: "Secret access blocked by runtime guard."
    };
  }

  if (blockedNetwork) {
    return {
      ...result,
      status: RUNTIME_STATES.BLOCKED_EXTERNAL_NETWORK,
      risk: "HIGH",
      output: "External network command blocked by runtime guard."
    };
  }

  return result;
}

function createLogEntry(result) {
  return {
    timestamp: new Date().toISOString(),
    requested_by: "chief_or_operator",
    command_id: result.commandId,
    command: result.command || "NOT_FOUND",
    permission_level: "DRY_RUN_ONLY",
    approval_status: "CHIEF_APPROVAL_REQUIRED",
    execution_status: result.executed ? "EXECUTED" : "NOT_EXECUTED",
    output_summary: result.output,
    files_changed: [],
    risks_detected: result.risk === "LOW" ? [] : [result.risk],
    rollback_notes: "No rollback required. DRY_RUN did not execute or mutate files."
  };
}

module.exports = {
  loadPolicy,
  loadAllowlist,
  loadRuntimeConfig,
  validateCommandRequest,
  validateProtectedPaths,
  validateBlockedCommand,
  validatePermissionLevel,
  simulateExecution,
  createRuntimeResult,
  createLogEntry
};
