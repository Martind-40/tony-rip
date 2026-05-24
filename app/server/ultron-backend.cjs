// ultron-backend.js — ULTRON v1.2 Mobile Backend Foundation
// Node HTTP nativo. Sin Express. Sin dependencias externas.
// Puerto 3001. DRY_RUN solamente.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 3001;
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const CONFIG_PATH = path.join(PROJECT_ROOT, "runtime", "runtime_config.json");
const MEMORY_ROOT = path.join(PROJECT_ROOT, "memory");

// ── Config ──────────────────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return { backend: { token: "ULTRON_LOCAL_OPERATOR_TOKEN" } };
  }
}

const CONFIG = loadConfig();
const TOKEN = CONFIG.backend?.token || "ULTRON_LOCAL_OPERATOR_TOKEN";

const MEMORY_WHITELIST = CONFIG.memory?.whitelist || [
  "operator_command_log.md",
  "v1_1_real_operator_testing_snapshot.json",
  "runtime_config.json"
];

const COMMAND_ALLOWLIST = [
  "pwd",
  "git status",
  "git log --oneline -5",
  "git diff --stat",
  "npm run build",
  "find . -maxdepth 2 -type f"
];

const BLOCKED_PATTERNS = [
  "git push", "rm", "sudo", "chmod", "chown",
  "curl", "wget", ".env", "secrets", "token",
  "key", "&&", "|", ";", ">"
];

// ── Logs en memoria ──────────────────────────────────────
const logs = [];
function addLog(type, data) {
  logs.unshift({ id: `LOG-${Date.now()}`, timestamp: new Date().toISOString(), type, ...data });
  if (logs.length > 100) logs.pop();
}

// ── Helpers ──────────────────────────────────────────────
function send(res, status, data, origin) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type, x-ultron-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(data));
}

function getAllowedOrigin(req) {
  const origin = req.headers.origin || "";
  const allowed = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    "https://tony-rip-orpin.vercel.app"
  ];
  return allowed.includes(origin) ? origin : allowed[0];
}

function requireToken(req, res, origin) {
  const token = req.headers["x-ultron-token"];
  if (!token || token !== TOKEN) {
    send(res, 401, { ok: false, blocked: true, reason: "Invalid token." }, origin);
    return false;
  }
  return true;
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function validateCommand(command) {
  if (!command || typeof command !== "string") {
    return { valid: false, reason: "Command is required." };
  }
  const normalized = command.trim().toLowerCase();
  for (const pattern of BLOCKED_PATTERNS) {
    if (normalized.includes(pattern.toLowerCase())) {
      return { valid: false, reason: `Blocked pattern detected: "${pattern}".` };
    }
  }
  const inAllowlist = COMMAND_ALLOWLIST.some(
    (allowed) => normalized === allowed.toLowerCase()
  );
  if (!inAllowlist) {
    return { valid: false, reason: "Command not in allowlist." };
  }
  return { valid: true };
}

// ── Router ───────────────────────────────────────────────
async function router(req, res) {
  const origin = getAllowedOrigin(req);
  const url = req.url.split("?")[0];
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    send(res, 204, {}, origin);
    return;
  }

  // GET /api/health — público
  if (method === "GET" && url === "/api/health") {
    send(res, 200, {
      ok: true,
      service: "ultron-backend",
      version: "v1.2",
      mode: "local-controlled",
      autonomy: "supervised",
      execution: "dry_run_only",
      external_network: false,
      secrets_access: false,
      timestamp: new Date().toISOString()
    }, origin);
    return;
  }

  // POST /api/chat — stub hasta v1.3
  if (method === "POST" && url === "/api/chat") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    addLog("chat_stub", { input: body.message || "" });
    send(res, 200, {
      ok: true,
      mode: "local_stub",
      message: "Claude Proxy is blocked until ULTRON v1.3.",
      input: body.message || ""
    }, origin);
    return;
  }

  // GET /api/commands — allowlist
  if (method === "GET" && url === "/api/commands") {
    if (!requireToken(req, res, origin)) return;
    send(res, 200, {
      ok: true,
      commands: COMMAND_ALLOWLIST,
      execution: "DRY_RUN_ONLY",
      real_execution: false
    }, origin);
    return;
  }

  // POST /api/execute — DRY_RUN
  if (method === "POST" && url === "/api/execute") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const { command, approved } = body;

    if (!approved) {
      const result = { ok: false, blocked: true, reason: "Human approval required (approved: true)." };
      addLog("execute_blocked", { command, reason: result.reason });
      send(res, 403, result, origin);
      return;
    }

    const validation = validateCommand(command);
    if (!validation.valid) {
      const result = { ok: false, blocked: true, reason: validation.reason };
      addLog("execute_blocked", { command, reason: validation.reason });
      send(res, 403, result, origin);
      return;
    }

    const result = {
      ok: true,
      execution: "DRY_RUN",
      command,
      approved: true,
      message: "Command validated but not executed. Real execution remains blocked until ULTRON v1.4."
    };
    addLog("execute_dry_run", { command, status: "DRY_RUN_VALIDATED" });
    send(res, 200, result, origin);
    return;
  }

  // GET /api/memory/:file — whitelist fija
  if (method === "GET" && url.startsWith("/api/memory/")) {
    if (!requireToken(req, res, origin)) return;
    const fileName = url.replace("/api/memory/", "");

    // Bloquear path traversal y patrones peligrosos
    const dangerous = ["../", ".env", "private", "secret", "key", "token", "credential", "/"];
    for (const d of dangerous) {
      if (fileName.includes(d)) {
        send(res, 403, { ok: false, blocked: true, reason: "Access denied." }, origin);
        return;
      }
    }

    if (!MEMORY_WHITELIST.includes(fileName)) {
      send(res, 403, { ok: false, blocked: true, reason: `File '${fileName}' not in memory whitelist.` }, origin);
      return;
    }

    // runtime_config.json viene de runtime/, los demás de memory/
    const filePath = fileName === "runtime_config.json"
      ? CONFIG_PATH
      : path.join(MEMORY_ROOT, fileName);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      send(res, 200, { ok: true, file: fileName, content }, origin);
    } catch {
      send(res, 404, { ok: false, reason: `File not found: ${fileName}` }, origin);
    }
    return;
  }

  // GET /api/logs
  if (method === "GET" && url === "/api/logs") {
    if (!requireToken(req, res, origin)) return;
    send(res, 200, { ok: true, count: logs.length, logs }, origin);
    return;
  }

  // 404
  send(res, 404, { ok: false, reason: "Endpoint not found." }, origin);
}

// ── Start ────────────────────────────────────────────────
const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`
██╗   ██╗██╗  ████████╗██████╗  ██████╗ ███╗   ██╗
██║   ██║██║  ╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║
██║   ██║██║     ██║   ██████╔╝██║   ██║██╔██╗ ██║
██║   ██║██║     ██║   ██╔══██╗██║   ██║██║╚██╗██║
╚██████╔╝███████╗██║   ██║  ██║╚██████╔╝██║ ╚████║
 ╚═════╝ ╚══════╝╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

ULTRON v1.2 — Mobile Backend Foundation
Mode: LOCAL-CONTROLLED | Execution: DRY_RUN_ONLY
Port: ${PORT}
Token: ${TOKEN}

Endpoints:
  GET  /api/health        (public)
  POST /api/chat          (token required — stub)
  GET  /api/commands      (token required)
  POST /api/execute       (token required — dry run)
  GET  /api/memory/:file  (token required — whitelist only)
  GET  /api/logs          (token required)

Claude API: BLOCKED_UNTIL_V1_3
Real execution: BLOCKED
External network: OFF
  `);
});
