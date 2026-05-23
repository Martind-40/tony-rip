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
  "sudo",
  "chmod",
  "chown",
  "git reset --hard",
  "git push",
  "curl",
  "wget",
  "npm install"
];

const SECRET_PATTERNS = [
  ".env",
  "secret",
  "secrets",
  "credential",
  "credentials",
  "token",
  "api_key",
  "apikey",
  "private_key",
  ".ssh"
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

function isDestructiveCommand(command) {
  const normalized = normalizeCommand(command);
  return (
    normalized.includes("rm ") ||
    normalized === "rm" ||
    normalized.includes("git reset --hard") ||
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
    normalized.includes("http://") ||
    normalized.includes("https://") ||
    normalized.includes("npm install")
  );
}

function isSecretAccess(command) {
  const normalized = normalizeCommand(command);
  return SECRET_PATTERNS.some((pattern) => normalized.includes(pattern));
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

  if (hasBlockedKeyword(commandRecord.command)) {
    return {
      status: RUNTIME_STATES.BLOCKED_DESTRUCTIVE_COMMAND,
      risk: "HIGH",
      reason: "Command contains a blocked keyword."
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
    reason: "Command passed DRY_RUN validation. Real execution remains disabled."
  };
}

module.exports = {
  RUNTIME_STATES,
  PERMISSION_LEVELS,
  BLOCKED_KEYWORDS,
  SECRET_PATTERNS,
  hasBlockedKeyword,
  isDestructiveCommand,
  isExternalNetworkCommand,
  isSecretAccess,
  isProtectedPath,
  isAllowedPath,
  validateRuntimeCommand
};
