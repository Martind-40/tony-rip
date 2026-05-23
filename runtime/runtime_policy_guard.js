const path = require("node:path");

const RUNTIME_STATES = {
  DRY_RUN_READY: "DRY_RUN_READY",
  VALIDATION_PASS: "VALIDATION_PASS",
  VALIDATION_FAIL: "VALIDATION_FAIL",
  BLOCKED_BY_POLICY: "BLOCKED_BY_POLICY",
  BLOCKED_PROTECTED_PATH: "BLOCKED_PROTECTED_PATH",
  BLOCKED_DESTRUCTIVE_COMMAND: "BLOCKED_DESTRUCTIVE_COMMAND",
  BLOCKED_EXTERNAL_NETWORK: "BLOCKED_EXTERNAL_NETWORK",
  BLOCKED_SECRET_ACCESS: "BLOCKED_SECRET_ACCESS",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  READY_FOR_PRIVATE_MODE_REVIEW: "READY_FOR_PRIVATE_MODE_REVIEW"
};

const PERMISSION_LEVELS = [
  "READ_ONLY",
  "SUGGEST_ONLY",
  "SAFE_EXECUTE",
  "APPROVAL_REQUIRED",
  "BLOCKED"
];

const BLOCKED_KEYWORDS = [
  "rm",
  "rm -rf",
  "sudo",
  "chmod",
  "chown",
  "git reset --hard",
  "git push",
  "curl",
  "wget",
  "npm install",
  "ssh",
  "scp",
  "rsync"
];

const SECRET_PATTERNS = [
  ".env",
  ".ssh",
  "id_rsa",
  "id_ed25519",
  ".pem",
  "private_key",
  "api_key",
  "apikey",
  "key",
  "secret",
  "secrets",
  "credential",
  "credentials",
  "token",
  "password"
];

const DANGEROUS_PIPE_TARGETS = [
  "sudo",
  "rm",
  "chmod",
  "chown",
  "curl",
  "wget",
  "ssh",
  "scp",
  "rsync",
  "npm install",
  "git push",
  "git reset --hard"
];

const CHAIN_OPERATORS = ["&&", "||", ";", "$(", "`"];

const DOUBLE_CONFIRMATION_PATTERNS = [
  "git add",
  "git commit",
  "runtime_config.json",
  "runtime_policy_guard.js",
  "local_command_bridge",
  "safe_commands.allowlist",
  "high_power",
  "DRY_RUN_ONLY"
];

function normalizeCommand(command) {
  return String(command || "").trim().toLowerCase();
}

function normalizePath(value) {
  return path.resolve(String(value || ""));
}

function hasBlockedKeyword(command) {
  const normalized = normalizeCommand(command);
  return BLOCKED_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function isInsideUltronPath(workingDirectory) {
  const target = normalizePath(workingDirectory);
  const ultronRoot = normalizePath("/Users/macbook/ultron");
  return target === ultronRoot || target.startsWith(`${ultronRoot}${path.sep}`);
}

function isDestructiveCommand(command) {
  const normalized = normalizeCommand(command);
  return (
    normalized.includes("rm -rf") ||
    normalized.includes("rm ") ||
    normalized === "rm" ||
    normalized.includes("git reset --hard") ||
    normalized.includes("git push") ||
    normalized.includes("sudo") ||
    normalized.includes("chmod") ||
    normalized.includes("chown") ||
    normalized.includes(">") ||
    normalized.includes("tee ")
  );
}

function isExternalNetworkCommand(command) {
  const normalized = normalizeCommand(command);
  return (
    normalized.includes("curl") ||
    normalized.includes("wget") ||
    normalized.includes("ssh ") ||
    normalized.includes("scp ") ||
    normalized.includes("rsync ") ||
    normalized.includes("http://") ||
    normalized.includes("https://") ||
    normalized.includes("npm install")
  );
}

function isSecretAccess(command) {
  const normalized = normalizeCommand(command);
  return SECRET_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function hasUnsafeRedirection(command) {
  const normalized = normalizeCommand(command);
  if (!normalized.includes(">")) {
    return false;
  }

  return (
    normalized.includes("/users/macbook/aethermind") ||
    normalized.includes("/users/macbook/.") ||
    normalized.includes("../") ||
    isSecretAccess(normalized)
  );
}

function hasDangerousPipe(command) {
  const normalized = normalizeCommand(command);
  if (!normalized.includes("|")) {
    return false;
  }

  return DANGEROUS_PIPE_TARGETS.some((target) => normalized.includes(`| ${target}`));
}

function hasUnvalidatedCommandChain(command) {
  const normalized = normalizeCommand(command);
  return CHAIN_OPERATORS.some((operator) => normalized.includes(operator));
}

function requiresDoubleConfirmation(command) {
  const normalized = String(command || "");
  const lowered = normalized.toLowerCase();
  return DOUBLE_CONFIRMATION_PATTERNS.some((pattern) =>
    pattern === "DRY_RUN_ONLY"
      ? normalized.includes(pattern)
      : lowered.includes(pattern.toLowerCase())
  );
}

function isProtectedPath(workingDirectory, protectedPaths = []) {
  const target = normalizePath(workingDirectory);
  return protectedPaths.some((protectedPath) => {
    const protectedRoot = normalizePath(protectedPath);
    return target === protectedRoot || target.startsWith(`${protectedRoot}${path.sep}`);
  });
}

function isAllowedPath(workingDirectory, allowedPaths = []) {
  const target = normalizePath(workingDirectory);
  return allowedPaths.some((allowedPath) => {
    const allowedRoot = normalizePath(allowedPath);
    return target === allowedRoot || target.startsWith(`${allowedRoot}${path.sep}`);
  });
}

function validateRuntimeCommand(commandRecord, policy = {}, runtimeConfig = {}) {
  if (!commandRecord) {
    return {
      status: RUNTIME_STATES.VALIDATION_FAIL,
      risk: "HIGH",
      reason: "Command record was not found in allowlist."
    };
  }

  if (!PERMISSION_LEVELS.includes(commandRecord.permission_level)) {
    return {
      status: RUNTIME_STATES.VALIDATION_FAIL,
      risk: "HIGH",
      reason: "Command permission level is not recognized."
    };
  }

  if (commandRecord.permission_level === "BLOCKED" || commandRecord.destructive) {
    return {
      status: RUNTIME_STATES.BLOCKED_BY_POLICY,
      risk: "HIGH",
      reason: "Command is blocked or marked destructive."
    };
  }

  if (!isInsideUltronPath(commandRecord.working_directory)) {
    return {
      status: RUNTIME_STATES.BLOCKED_PROTECTED_PATH,
      risk: "HIGH",
      reason: "Working directory must stay inside /Users/macbook/ultron."
    };
  }

  if (hasBlockedKeyword(commandRecord.command)) {
    return {
      status: RUNTIME_STATES.BLOCKED_DESTRUCTIVE_COMMAND,
      risk: "HIGH",
      reason: "Command contains a blocked keyword."
    };
  }

  if (isDestructiveCommand(commandRecord.command)) {
    return {
      status: RUNTIME_STATES.BLOCKED_DESTRUCTIVE_COMMAND,
      risk: "HIGH",
      reason: "Command is destructive or mutates protected execution state."
    };
  }

  if (isExternalNetworkCommand(commandRecord.command)) {
    return {
      status: RUNTIME_STATES.BLOCKED_EXTERNAL_NETWORK,
      risk: "HIGH",
      reason: "External network or installer command is blocked."
    };
  }

  if (isSecretAccess(commandRecord.command) || isSecretAccess(commandRecord.working_directory)) {
    return {
      status: RUNTIME_STATES.BLOCKED_SECRET_ACCESS,
      risk: "HIGH",
      reason: "Command attempts to access secrets or secret-like paths."
    };
  }

  if (hasUnsafeRedirection(commandRecord.command)) {
    return {
      status: RUNTIME_STATES.BLOCKED_PROTECTED_PATH,
      risk: "HIGH",
      reason: "Unsafe redirection toward protected or secret-like paths is blocked."
    };
  }

  if (hasDangerousPipe(commandRecord.command)) {
    return {
      status: RUNTIME_STATES.BLOCKED_BY_POLICY,
      risk: "HIGH",
      reason: "Pipe into dangerous command is blocked."
    };
  }

  if (hasUnvalidatedCommandChain(commandRecord.command)) {
    return {
      status: RUNTIME_STATES.APPROVAL_REQUIRED,
      risk: "MEDIUM",
      reason: "Chained command requires explicit validation before future execution."
    };
  }

  if (isProtectedPath(commandRecord.working_directory, policy.protected_paths)) {
    return {
      status: RUNTIME_STATES.BLOCKED_PROTECTED_PATH,
      risk: "HIGH",
      reason: "Command targets a protected path."
    };
  }

  if (!isAllowedPath(commandRecord.working_directory, policy.allowed_paths)) {
    return {
      status: RUNTIME_STATES.BLOCKED_PROTECTED_PATH,
      risk: "HIGH",
      reason: "Command working directory is outside approved ULTRON scope."
    };
  }

  if (runtimeConfig.real_execution_enabled !== false) {
    return {
      status: RUNTIME_STATES.APPROVAL_REQUIRED,
      risk: "MEDIUM",
      reason: "Runtime config must keep real execution disabled for this layer."
    };
  }

  return {
    status: RUNTIME_STATES.VALIDATION_PASS,
    risk: commandRecord.risk_level || "LOW",
    reason: requiresDoubleConfirmation(commandRecord.command)
      ? "Command passed DRY_RUN validation but requires double confirmation for future execution."
      : "Command passed DRY_RUN validation. Real execution remains disabled.",
    requiresDoubleConfirmation: requiresDoubleConfirmation(commandRecord.command)
  };
}

module.exports = {
  RUNTIME_STATES,
  PERMISSION_LEVELS,
  BLOCKED_KEYWORDS,
  SECRET_PATTERNS,
  hasBlockedKeyword,
  isInsideUltronPath,
  isDestructiveCommand,
  isExternalNetworkCommand,
  isSecretAccess,
  hasUnsafeRedirection,
  hasDangerousPipe,
  hasUnvalidatedCommandChain,
  requiresDoubleConfirmation,
  isProtectedPath,
  isAllowedPath,
  validateRuntimeCommand
};
