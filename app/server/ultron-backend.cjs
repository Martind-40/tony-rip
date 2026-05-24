// ultron-backend.cjs — ULTRON v1.5 Vercel Secure Environment
// Node HTTP nativo. Sin Express. Sin dependencias externas.
// Claude proxy controlled chat brain. API keys stay backend-only.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.ULTRON_BACKEND_PORT || 3001);
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const CONFIG_PATH = path.join(PROJECT_ROOT, "runtime", "runtime_config.json");
const MEMORY_ROOT = path.join(PROJECT_ROOT, "memory");
const ENV_PATH = path.join(__dirname, ".env");

const ULTRON_SYSTEM_PROMPT = [
  "You are ULTRON in supervised autonomy mode.",
  "Do not claim autonomous access to files, shell, secrets, private memory, email, calendar, or external systems.",
  "Answer only as a controlled assistant.",
  "Keep responses concise.",
  "Respond in the same language the user writes in."
].join(" ");

// ── Config ──────────────────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return { backend: { token: "ULTRON_LOCAL_OPERATOR_TOKEN" } };
  }
}

function loadLocalEnv() {
  const env = {};
  try {
    const content = fs.readFileSync(ENV_PATH, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      env[key] = value.replace(/^["']|["']$/g, "");
    }
  } catch {
    // Missing local env is allowed. Chat returns a controlled stub.
  }
  return env;
}

const CONFIG = loadConfig();
const LOCAL_ENV = loadLocalEnv();
const MODE = process.env.ULTRON_MODE || LOCAL_ENV.ULTRON_MODE || CONFIG.mode || "SUPERVISED_AUTONOMY";
const TOKEN = process.env.ULTRON_TOKEN || LOCAL_ENV.ULTRON_TOKEN || CONFIG.backend?.token || "ULTRON_LOCAL_OPERATOR_TOKEN";
const AI_PROVIDER = normalizeProvider(process.env.AI_PROVIDER || LOCAL_ENV.AI_PROVIDER || CONFIG.aiProvider?.default || "claude");
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || LOCAL_ENV.ANTHROPIC_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || LOCAL_ENV.OPENAI_API_KEY || "";
const HAS_ANTHROPIC_KEY = Boolean(ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.startsWith("sk-ant-"));
const HAS_OPENAI_KEY = Boolean(OPENAI_API_KEY && OPENAI_API_KEY.startsWith("sk-"));

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

const CHAT_BLOCKED_PATTERNS = [
  ".env", "api key", "apikey", "secret", "token",
  "run shell", "execute shell", "terminal command",
  "read file", "write file", "delete file"
];

// ── Logs en memoria ──────────────────────────────────────
const logs = [];
function addLog(type, data) {
  logs.unshift({ id: `LOG-${Date.now()}`, timestamp: new Date().toISOString(), type, ...data });
  if (logs.length > 100) logs.pop();
}

function safeError(message) {
  return String(message || "Controlled error.")
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[REDACTED]")
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, "[REDACTED]");
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
    "http://localhost:5175",
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

function normalizeProvider(provider) {
  const requested = String(provider || "claude").toLowerCase();
  if (["gpt4", "gpt-4o", "gpt-4o-mini", "openai"].includes(requested)) return "openai";
  return "claude";
}

function providerReady(provider) {
  return provider === "openai" ? HAS_OPENAI_KEY : HAS_ANTHROPIC_KEY;
}

function providerStatus(provider) {
  return providerReady(provider) ? "READY_WITH_KEY" : "WAITING_FOR_KEY";
}

function selectedProviderStatus() {
  return providerStatus(AI_PROVIDER);
}

function extractAnthropicText(data) {
  if (!data || !Array.isArray(data.content)) return "";
  return data.content
    .map((part) => part?.type === "text" ? part.text : "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function callClaude(message) {
  if (!HAS_ANTHROPIC_KEY) {
    return {
      statusCode: 503,
      ok: false,
      status: "WAITING_FOR_KEY",
      provider: "claude",
      model: "claude",
      message: "Claude Proxy configured but ANTHROPIC_API_KEY is missing."
    };
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 160,
      system: ULTRON_SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      statusCode: 502,
      provider: "claude",
      model: "claude-sonnet-4-5",
      message: "Claude API returned a controlled error.",
      reason: safeError(data.error?.message || `HTTP ${response.status}`)
    };
  }

  return {
    statusCode: 200,
    ok: true,
    status: "VALIDATED_CONTROLLED_CALL",
    provider: "claude",
    model: "claude-sonnet-4-5",
    message: extractAnthropicText(data) || "Claude returned no text."
  };
}

async function callOpenAI(message) {
  if (!HAS_OPENAI_KEY) {
    return {
      statusCode: 503,
      ok: false,
      status: "WAITING_FOR_KEY",
      provider: "openai",
      model: "gpt-4o-mini",
      message: "OpenAI Proxy configured but OPENAI_API_KEY is missing."
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 160,
      messages: [
        { role: "system", content: ULTRON_SYSTEM_PROMPT },
        { role: "user", content: message }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      statusCode: 502,
      provider: "openai",
      model: "gpt-4o-mini",
      message: "OpenAI API returned a controlled error.",
      reason: safeError(data.error?.message || `HTTP ${response.status}`)
    };
  }

  return {
    statusCode: 200,
    ok: true,
    status: "VALIDATED_CONTROLLED_CALL",
    provider: "openai",
    model: "gpt-4o-mini",
    message: data.choices?.[0]?.message?.content || "OpenAI returned no text."
  };
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

function validateChatMessage(message) {
  const normalized = message.toLowerCase();
  for (const pattern of CHAT_BLOCKED_PATTERNS) {
    if (normalized.includes(pattern)) {
      return { valid: false, reason: "Request blocked by supervised autonomy guardrails." };
    }
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
      version: "v1.5",
      mode: MODE,
      autonomy: "supervised",
      execution: "dry_run_only",
      aiProvider: AI_PROVIDER,
      aiProxy: selectedProviderStatus(),
      claudeProxy: HAS_ANTHROPIC_KEY ? "READY_WITH_KEY" : "WAITING_FOR_KEY",
      openaiProxy: HAS_OPENAI_KEY ? "READY_WITH_KEY" : "WAITING_FOR_KEY",
      external_network: providerReady(AI_PROVIDER) ? "CONTROLLED_CHAT_ONLY" : false,
      secrets_access: false,
      timestamp: new Date().toISOString()
    }, origin);
    return;
  }

  // POST /api/chat — Claude/GPT-4o proxy. Keys stay backend-only.
  if (method === "POST" && url === "/api/chat") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const message = String(body.message || "").trim();
    const provider = normalizeProvider(body.provider || body.model || AI_PROVIDER);

    if (!message) {
      send(res, 400, { ok: false, blocked: true, reason: "Message is required." }, origin);
      return;
    }

    const chatValidation = validateChatMessage(message);
    if (!chatValidation.valid) {
      send(res, 403, { ok: false, blocked: true, reason: chatValidation.reason }, origin);
      return;
    }

    addLog("chat_request", { provider, input_preview: message.slice(0, 120) });
    try {
      const result = provider === "openai"
        ? await callOpenAI(message)
        : await callClaude(message);
      addLog("chat_response", {
        provider: result.provider,
        model: result.model,
        ok: result.ok
      });
      send(res, result.statusCode || (result.ok ? 200 : 502), result, origin);
    } catch (error) {
      addLog("chat_error", { provider, reason: safeError(error.message) });
      send(res, 502, {
        ok: false,
        provider,
        model: provider === "openai" ? "gpt-4o-mini" : "claude-sonnet-4-5",
        message: "ULTRON chat brain failed safely.",
        reason: safeError(error.message)
      }, origin);
    }
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
                message: "Command validated but not executed. Real execution remains blocked."
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

ULTRON v1.5 — Vercel Secure Environment
Mode: ${MODE} | Execution: DRY_RUN_ONLY
Port: ${PORT}

Endpoints:
  GET  /api/health        (public)
  POST /api/chat          (token required — controlled proxy)
  GET  /api/commands      (token required)
  POST /api/execute       (token required — dry run)
  GET  /api/memory/:file  (token required — whitelist only)
  GET  /api/logs          (token required)

AI Provider: ${AI_PROVIDER}
AI Proxy: ${selectedProviderStatus()}
Claude Proxy: ${HAS_ANTHROPIC_KEY ? "READY_WITH_KEY" : "WAITING_FOR_KEY"}
OpenAI Proxy: ${HAS_OPENAI_KEY ? "READY_WITH_KEY" : "WAITING_FOR_KEY"}
Real execution: BLOCKED
External network: ${providerReady(AI_PROVIDER) ? "CONTROLLED_CHAT_ONLY" : "OFF"}
  `);
});
