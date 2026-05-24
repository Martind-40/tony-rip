const fs = require("node:fs");
const path = require("node:path");
const { execFile } = require("node:child_process");

const ROOT = "/Users/macbook/ultron";
const CONFIG_PATH = path.join(ROOT, "runtime", "controlled_local_execution_config.json");
const ALLOWLIST_PATH = path.join(ROOT, "runtime", "controlled_local_allowlist.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveInsideRoot(targetPath) {
  const resolved = path.resolve(targetPath);
  return resolved === ROOT || resolved.startsWith(`${ROOT}${path.sep}`);
}

function collectFiles(dir, depth = 0, maxDepth = 3, output = []) {
  if (depth > maxDepth || output.length >= 180) {
    return output;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT, fullPath);

    if (entry.isDirectory()) {
      collectFiles(fullPath, depth + 1, maxDepth, output);
    } else {
      output.push(relativePath);
    }

    if (output.length >= 180) {
      break;
    }
  }

  return output;
}

function parseArgs(argv) {
  const commandId = argv[2];
  const flags = new Set(argv.slice(3));
  const reasonIndex = argv.indexOf("--reason");
  const rollbackIndex = argv.indexOf("--rollback");

  return {
    commandId,
    chiefApproved: flags.has("--chief-approve"),
    reason: reasonIndex >= 0 ? argv[reasonIndex + 1] : "",
    rollback: rollbackIndex >= 0 ? argv[rollbackIndex + 1] : ""
  };
}

function assertSafeCommand(commandRecord, config, allowlist) {
  if (!commandRecord) {
    throw new Error("Command is not allowlisted.");
  }

  if (!config.controlled_local_execution_enabled) {
    throw new Error("Controlled local execution is not enabled.");
  }

  if (config.public_demo_ui_execution_enabled) {
    throw new Error("Browser/UI execution must remain disabled.");
  }

  if (!resolveInsideRoot(commandRecord.working_directory)) {
    throw new Error("Command working directory is outside ULTRON scope.");
  }

  const rawCommand = [
    commandRecord.executable,
    ...(commandRecord.args || []),
    commandRecord.operation || ""
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const blocked of allowlist.blocked_always) {
    if (rawCommand.includes(blocked.toLowerCase())) {
      throw new Error(`Blocked command token detected: ${blocked}`);
    }
  }

  if (commandRecord.type === "execFile" && !commandRecord.executable) {
    throw new Error("execFile command requires executable.");
  }
}

function appendLog(entry, config) {
  const logPath = config.log_path;
  if (!resolveInsideRoot(logPath)) {
    throw new Error("Log path is outside ULTRON scope.");
  }

  const body = [
    "",
    `## ${entry.timestamp}`,
    "",
    `- command_id: ${entry.command_id}`,
    `- label: ${entry.label}`,
    `- status: ${entry.status}`,
    `- risk: ${entry.risk}`,
    `- working_directory: ${entry.working_directory}`,
    `- approval: ${entry.approval}`,
    `- reason: ${entry.reason || "not provided"}`,
    `- rollback: ${entry.rollback || "no mutation / log-only rollback"}`,
    `- output_summary: ${entry.output_summary}`,
    ""
  ].join("\n");

  fs.appendFileSync(logPath, body);
}

function runBuiltin(commandRecord) {
  if (commandRecord.operation === "pwd") {
    return commandRecord.working_directory;
  }

  if (commandRecord.operation === "limited_file_scan") {
    return collectFiles(ROOT).join("\n");
  }

  throw new Error(`Unknown builtin operation: ${commandRecord.operation}`);
}

function runExecFile(commandRecord, config) {
  return new Promise((resolve, reject) => {
    execFile(
      commandRecord.executable,
      commandRecord.args,
      {
        cwd: commandRecord.working_directory,
        shell: false,
        timeout: config.max_timeout_ms,
        maxBuffer: config.max_output_chars * 2
      },
      (error, stdout, stderr) => {
        const output = [stdout, stderr].filter(Boolean).join("\n").trim();
        const summary = output.slice(0, config.max_output_chars);

        if (error) {
          reject(new Error(summary || error.message));
          return;
        }

        resolve(summary || "Command completed with no output.");
      }
    );
  });
}

async function main() {
  const config = readJson(CONFIG_PATH);
  const allowlist = readJson(ALLOWLIST_PATH);
  const args = parseArgs(process.argv);
  const commandRecord = allowlist.commands.find((command) => command.id === args.commandId);

  if (!args.commandId) {
    throw new Error("Usage: node runtime/controlled_local_executor.cjs <command_id> --chief-approve --reason <reason> --rollback <plan>");
  }

  if (!args.chiefApproved) {
    throw new Error("Chief approval flag is required: --chief-approve");
  }

  assertSafeCommand(commandRecord, config, allowlist);

  const output =
    commandRecord.type === "builtin"
      ? runBuiltin(commandRecord)
      : await runExecFile(commandRecord, config);

  const entry = {
    timestamp: new Date().toISOString(),
    command_id: commandRecord.id,
    label: commandRecord.label,
    status: "CONTROLLED_LOCAL_EXECUTION_COMPLETE",
    risk: commandRecord.risk,
    working_directory: commandRecord.working_directory,
    approval: "CHIEF_APPROVED",
    reason: args.reason,
    rollback: args.rollback,
    output_summary: output.replace(/\n/g, " | ").slice(0, config.max_output_chars)
  };

  appendLog(entry, config);
  console.log(JSON.stringify(entry, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "CONTROLLED_LOCAL_EXECUTION_BLOCKED", error: error.message }, null, 2));
  process.exitCode = 1;
});
