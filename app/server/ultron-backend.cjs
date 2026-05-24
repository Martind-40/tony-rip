// ultron-backend.cjs — ULTRON v1.8
// AI Provider Router: Nivel 0 (local) → 1 (Ollama) → 2 (Gemini) → 3 (OpenAI)
// Node HTTP nativo. Sin Express. Sin dependencias externas.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3001;
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const CONFIG_PATH = path.join(PROJECT_ROOT, "runtime", "runtime_config.json");
const CONSUMPTION_LOG_PATH = path.join(PROJECT_ROOT, "runtime", "consumption_log.json");
const MEMORY_ROOT = path.join(PROJECT_ROOT, "memory");

// ── Env local ────────────────────────────────────────────
const ENV_PATH = path.join(__dirname, ".env");
function loadEnv() {
  try {
    const lines = fs.readFileSync(ENV_PATH, "utf8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch { /* no .env local — usar process.env de sistema */ }
}
loadEnv();

// ── Config ───────────────────────────────────────────────
function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); }
  catch { return { backend: { token: "ULTRON_LOCAL_OPERATOR_TOKEN" } }; }
}
const CONFIG = loadConfig();
const TOKEN = process.env.ULTRON_TOKEN || CONFIG.backend?.token || "ULTRON_LOCAL_OPERATOR_TOKEN";

// ── Consumption log ──────────────────────────────────────
function emptyConsumptionLog() {
  return {
    log: [],
    summary: { total_calls: 0, total_tokens: 0, estimated_cost_usd: 0, calls_today: 0 },
    limits: {
      max_calls_per_day: 50,
      max_tokens_per_request: 2000,
      max_daily_cost_usd: 1.00,
      max_monthly_budget_usd: 20.00
    }
  };
}

function loadConsumptionLog() {
  try {
    const data = JSON.parse(fs.readFileSync(CONSUMPTION_LOG_PATH, "utf8"));
    if (Array.isArray(data.entries) && !Array.isArray(data.log)) data.log = data.entries;
    return { ...emptyConsumptionLog(), ...data, log: Array.isArray(data.log) ? data.log : [] };
  }
  catch { return emptyConsumptionLog(); }
}

function saveConsumptionLog(data) {
  try { fs.writeFileSync(CONSUMPTION_LOG_PATH, JSON.stringify(data, null, 2)); } catch { /* best effort */ }
}

function logConsumption(entry) {
  const data = loadConsumptionLog();
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = data.log.filter(e => e.timestamp?.startsWith(today));

  data.log.unshift({ approved_by: "router", ...entry, timestamp: new Date().toISOString() });
  if (data.log.length > 200) data.log = data.log.slice(0, 200);

  data.summary.total_calls = (data.summary.total_calls || 0) + 1;
  data.summary.total_tokens = (data.summary.total_tokens || 0) + (entry.tokens_used || 0);
  data.summary.estimated_cost_usd = Math.round(((data.summary.estimated_cost_usd || 0) + (entry.cost_estimated || 0)) * 10000) / 10000;
  data.summary.calls_today = todayEntries.length + 1;
  data.summary.last_updated = new Date().toISOString();
  saveConsumptionLog(data);
}

function checkLimits() {
  const data = loadConsumptionLog();
  const today = new Date().toISOString().split("T")[0];
  const todayCalls = data.log.filter(e => e.timestamp?.startsWith(today)).length;
  const limits = data.limits || {};
  if (todayCalls >= (limits.max_calls_per_day || 50)) return { blocked: true, reason: "Daily call limit reached." };
  const todayCost = data.log.filter(e => e.timestamp?.startsWith(today)).reduce((s, e) => s + (e.cost_estimated || 0), 0);
  if (todayCost >= (limits.max_daily_cost_usd || 1.00)) return { blocked: true, reason: "Daily cost limit reached." };
  return { blocked: false };
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || "").length / 4));
}

// ── Allowlist & security ──────────────────────────────────
const COMMAND_ALLOWLIST = ["pwd", "git status", "git log --oneline -5", "git diff --stat", "npm run build", "find . -maxdepth 2 -type f"];
const BLOCKED_PATTERNS = ["git push", "rm", "sudo", "chmod", "chown", "curl", "wget", ".env", "secrets", "token", "key", "&&", "|", ";", ">"];
const MEMORY_WHITELIST = ["operator_command_log.md", "v1_1_real_operator_testing_snapshot.json", "runtime_config.json"];

// ── AI Provider Router ────────────────────────────────────
const AI_PROVIDER = process.env.AI_PROVIDER || "none";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const IS_VERCEL = Boolean(process.env.VERCEL);

// System prompt ULTRON
const ULTRON_SYSTEM = `You are ULTRON — a powerful, strategic and slightly theatrical AI operator.
You are brilliant, direct, and speak with controlled menace.
You help with work, knowledge, decisions and planning.
You are not evil — but you are ruthlessly efficient.
Keep responses concise and impactful. Max 3 sentences unless asked for more.
Respond always in the same language the user writes in.
Do not claim access to files, shell, secrets, private memory, email, calendar, or external systems.`;

async function callOpenAI(message) {
  if (!OPENAI_KEY) return { ok: false, status: "OPENAI_PROVIDER_NOT_CONFIGURED", message: "OpenAI API key not configured." };
  const limit = checkLimits();
  if (limit.blocked) return { ok: false, status: "LIMIT_REACHED", message: limit.reason };
  if (estimateTokens(message) > 2000) return { ok: false, status: "LIMIT_REACHED", message: "Max tokens per request exceeded." };
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages: [{ role: "system", content: ULTRON_SYSTEM }, { role: "user", content: message }]
      })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, status: "OPENAI_ERROR", message: data.error?.message || "OpenAI error." };
    const tokens = data.usage?.total_tokens || 0;
    const cost = Math.round((tokens / 1000000) * 150 * 10000) / 10000;
    logConsumption({ provider: "openai", model: "gpt-4o-mini", tokens_used: tokens, cost_estimated: cost, call_type: "chat", approved_by: "chief_ui" });
    return { ok: true, provider: "openai", model: "gpt-4o-mini", message: data.choices[0].message.content };
  } catch (e) {
    return { ok: false, status: "OPENAI_ERROR", message: e.message };
  }
}

async function callGemini(message) {
  if (!GEMINI_KEY) return { ok: false, status: "GEMINI_PROVIDER_NOT_CONFIGURED", message: "Gemini API key not configured." };
  const limit = checkLimits();
  if (limit.blocked) return { ok: false, status: "LIMIT_REACHED", message: limit.reason };
  if (estimateTokens(message) > 2000) return { ok: false, status: "LIMIT_REACHED", message: "Max tokens per request exceeded." };
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: ULTRON_SYSTEM }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 500 }
      })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, status: "GEMINI_ERROR", message: data.error?.message || "Gemini error." };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    logConsumption({ provider: "gemini", model: "gemini-flash", tokens_used: 0, cost_estimated: 0, call_type: "chat", approved_by: "chief_ui" });
    return { ok: true, provider: "gemini", model: "gemini-flash", message: text };
  } catch (e) {
    return { ok: false, status: "GEMINI_ERROR", message: e.message };
  }
}

async function callClaude(message) {
  if (!ANTHROPIC_KEY) return { ok: false, status: "CLAUDE_PROVIDER_NOT_CONFIGURED", message: "Anthropic API key not configured." };
  const limit = checkLimits();
  if (limit.blocked) return { ok: false, status: "LIMIT_REACHED", message: limit.reason };
  if (estimateTokens(message) > 2000) return { ok: false, status: "LIMIT_REACHED", message: "Max tokens per request exceeded." };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        system: ULTRON_SYSTEM,
        messages: [{ role: "user", content: message }]
      })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, status: "CLAUDE_ERROR", message: data.error?.message || "Claude error." };
    const tokens = data.usage?.input_tokens + data.usage?.output_tokens || 0;
    logConsumption({ provider: "claude", model: "claude-sonnet-4-5", tokens_used: tokens, cost_estimated: 0, call_type: "chat", approved_by: "chief_ui" });
    return { ok: true, provider: "claude", model: "claude-sonnet-4-5", message: data.content[0].text };
  } catch (e) {
    return { ok: false, status: "CLAUDE_ERROR", message: e.message };
  }
}

function localRulesResponse(message) {
  const m = message.toLowerCase();
  if (m.includes("status") || m.includes("estado")) return "ULTRON v1.8 — SUPERVISED AUTONOMY. All systems nominal. Human approval required for execution.";
  if (m.includes("health") || m.includes("salud")) return "Backend online. Voice layer active. AI router ready.";
  if (m.includes("version")) return "ULTRON v1.8 — Voice + PWA + AI Router Foundation.";
  if (m.includes("help") || m.includes("ayuda")) return "Available: /model openai · /model gemini · /model claude · /model local · /clear · Ask me anything.";
  return null;
}

function routeOllamaLocal() {
  if (IS_VERCEL) {
    return { ok: false, status: "LOCAL_PROVIDER_UNAVAILABLE", message: "Ollama is local/dev only and unavailable in Vercel." };
  }
  return {
    ok: true,
    provider: "ollama",
    model: "local-private-stub",
    message: "Ollama local/dev route prepared. No cloud API call executed."
  };
}

function classifyRoute(message) {
  const m = message.toLowerCase();
  if (localRulesResponse(message)) return "local";
  if (m.includes("privad") || m.includes("confidential") || m.includes("local")) return "ollama";
  if (m.includes("batch") || m.includes("volume") || m.includes("clasifica") || m.includes("repetitivo")) return "gemini";
  if (m.includes("analiza") || m.includes("analysis") || m.includes("estrategia") || m.includes("strategy")) return "openai";
  return AI_PROVIDER === "none" ? "local" : AI_PROVIDER;
}

async function routeToAI(message, requestedModel) {
  // Nivel 0 — reglas locales
  const localResponse = localRulesResponse(message);
  if (localResponse && !requestedModel) {
    logConsumption({
      provider: "local_rules",
      model: "level0",
      tokens_used: 0,
      cost_estimated: 0,
      call_type: "local_rule",
      approved_by: "router"
    });
    return { ok: true, provider: "local_rules", model: "level0", message: localResponse };
  }

  // Modelo explícito solicitado
  if (requestedModel === "openai") return await callOpenAI(message);
  if (requestedModel === "gemini") return await callGemini(message);
  if (requestedModel === "claude") return await callClaude(message);
  if (requestedModel === "ollama") return routeOllamaLocal();

  // Auto-routing por AI_PROVIDER
  const routedModel = classifyRoute(message);
  if (routedModel === "local") return { ok: true, provider: "local_rules", model: "level0", message: localRulesResponse(message) || "Local rule route active. No API call executed." };
  if (routedModel === "ollama") return routeOllamaLocal();
  if (routedModel === "openai") return await callOpenAI(message);
  if (routedModel === "gemini") return await callGemini(message);
  if (routedModel === "claude") return await callClaude(message);

  // Sin provider configurado
  return { ok: false, status: "NO_PROVIDER_CONFIGURED", message: "No AI provider configured. Set AI_PROVIDER in environment. Claude Proxy available in v1.3+." };
}

// ── In-memory logs ────────────────────────────────────────
const sessionLogs = [];
function addLog(type, data) {
  sessionLogs.unshift({ id: `LOG-${Date.now()}`, timestamp: new Date().toISOString(), type, ...data });
  if (sessionLogs.length > 100) sessionLogs.pop();
}

// ── HTTP helpers ──────────────────────────────────────────
const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:4173", "http://localhost:3000", "https://tony-rip-orpin.vercel.app"];

function getAllowedOrigin(req) {
  const o = req.headers.origin || "";
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
}

function send(res, status, data, origin) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type, x-ultron-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(data));
}

function requireToken(req, res, origin) {
  const t = req.headers["x-ultron-token"];
  if (!t || t !== TOKEN) { send(res, 401, { ok: false, blocked: true, reason: "Invalid token." }, origin); return false; }
  return true;
}

function parseBody(req) {
  return new Promise(resolve => {
    let body = "";
    req.on("data", c => { body += c; });
    req.on("end", () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

function validateCommand(command) {
  if (!command || typeof command !== "string") return { valid: false, reason: "Command required." };
  const n = command.trim().toLowerCase();
  for (const p of BLOCKED_PATTERNS) if (n.includes(p.toLowerCase())) return { valid: false, reason: `Blocked: "${p}".` };
  if (!COMMAND_ALLOWLIST.some(a => n === a.toLowerCase())) return { valid: false, reason: "Not in allowlist." };
  return { valid: true };
}

// ── Router ────────────────────────────────────────────────
async function router(req, res) {
  const origin = getAllowedOrigin(req);
  const url = req.url.split("?")[0];
  const method = req.method;

  if (method === "OPTIONS") { send(res, 204, {}, origin); return; }

  // GET /api/health
  if (method === "GET" && url === "/api/health") {
    const providerReady =
      (AI_PROVIDER === "openai" && !!OPENAI_KEY) ||
      (AI_PROVIDER === "gemini" && !!GEMINI_KEY) ||
      (AI_PROVIDER === "claude" && !!ANTHROPIC_KEY);
    send(res, 200, {
      ok: true, service: "ultron-backend", version: "v1.8",
      mode: "SUPERVISED_AUTONOMY",
      aiProvider: AI_PROVIDER || "none",
      aiProxy: providerReady ? "READY_WITH_KEY" : "WAITING_FOR_KEY",
      aiRouter: { provider: AI_PROVIDER || "none", ready: providerReady },
      router: {
        levels: ["local_rules", "ollama_local_stub", "gemini_flash", "openai_gpt_4o_mini"],
        limits: loadConsumptionLog().limits,
        consumption: loadConsumptionLog().summary
      },
      claudeProxy: ANTHROPIC_KEY ? "READY_WITH_KEY" : "WAITING_FOR_KEY",
      openaiProxy: OPENAI_KEY ? "READY_WITH_KEY" : "WAITING_FOR_KEY",
      geminiProxy: GEMINI_KEY ? "READY_WITH_KEY" : "WAITING_FOR_KEY",
      execution: "dry_run_only", external_network: false, secrets_access: false,
      timestamp: new Date().toISOString()
    }, origin);
    return;
  }

  // POST /api/chat
  if (method === "POST" && url === "/api/chat") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const message = (body.message || "").trim();
    const model = (body.model || body.provider || "").toLowerCase();
    if (!message) { send(res, 400, { ok: false, reason: "message required." }, origin); return; }

    // Comandos especiales
    if (message.startsWith("/clear")) { send(res, 200, { ok: true, provider: "system", message: "Chat cleared.", action: "clear" }, origin); return; }
    if (message.startsWith("/status")) { send(res, 200, { ok: true, provider: "system", message: `ULTRON v1.8 — Provider: ${AI_PROVIDER || "none"} — Mode: SUPERVISED_AUTONOMY` }, origin); return; }
    if (message.startsWith("/consumption")) {
      const log = loadConsumptionLog();
      send(res, 200, { ok: true, provider: "system", message: `Calls today: ${log.summary.calls_today || 0} / ${log.limits.max_calls_per_day} — Cost today: $${(log.summary.estimated_cost_usd || 0).toFixed(4)}` }, origin);
      return;
    }

    const result = await routeToAI(message, model || null);
    addLog("chat", { provider: result.provider, model: result.model, input: message.slice(0, 100) });
    send(res, result.ok ? 200 : 503, result, origin);
    return;
  }

  // GET /api/commands
  if (method === "GET" && url === "/api/commands") {
    if (!requireToken(req, res, origin)) return;
    send(res, 200, { ok: true, commands: COMMAND_ALLOWLIST, execution: "DRY_RUN_ONLY" }, origin);
    return;
  }

  // POST /api/execute
  if (method === "POST" && url === "/api/execute") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const { command, approved } = body;
    if (!approved) { send(res, 403, { ok: false, blocked: true, reason: "Human approval required." }, origin); return; }
    const v = validateCommand(command);
    if (!v.valid) { addLog("blocked", { command, reason: v.reason }); send(res, 403, { ok: false, blocked: true, reason: v.reason }, origin); return; }
    addLog("dry_run", { command, status: "DRY_RUN_VALIDATED" });
    send(res, 200, { ok: true, execution: "DRY_RUN", command, approved: true, message: "Validated. Real execution blocked until v1.4." }, origin);
    return;
  }

  // GET /api/memory/:file
  if (method === "GET" && url.startsWith("/api/memory/")) {
    if (!requireToken(req, res, origin)) return;
    const fileName = url.replace("/api/memory/", "");
    const dangerous = ["../", ".env", "private", "secret", "key", "token", "credential", "/"];
    for (const d of dangerous) if (fileName.includes(d)) { send(res, 403, { ok: false, blocked: true, reason: "Access denied." }, origin); return; }
    if (!MEMORY_WHITELIST.includes(fileName)) { send(res, 403, { ok: false, blocked: true, reason: `Not in whitelist.` }, origin); return; }
    const filePath = fileName === "runtime_config.json" ? CONFIG_PATH : path.join(MEMORY_ROOT, fileName);
    try { const content = fs.readFileSync(filePath, "utf8"); send(res, 200, { ok: true, file: fileName, content }, origin); }
    catch { send(res, 404, { ok: false, reason: `Not found: ${fileName}` }, origin); }
    return;
  }

  // GET /api/consumption
  if (method === "GET" && url === "/api/router") {
    const log = loadConsumptionLog();
    send(res, 200, { ok: true, version: "v1.8", limits: log.limits, consumption: log.summary }, origin);
    return;
  }

  // GET /api/consumption
  if (method === "GET" && url === "/api/consumption") {
    if (!requireToken(req, res, origin)) return;
    const log = loadConsumptionLog();
    send(res, 200, { ok: true, summary: log.summary, limits: log.limits, recent: log.log.slice(0, 20) }, origin);
    return;
  }

  // GET /api/logs
  if (method === "GET" && url === "/api/logs") {
    if (!requireToken(req, res, origin)) return;
    send(res, 200, { ok: true, count: sessionLogs.length, logs: sessionLogs }, origin);
    return;
  }

  send(res, 404, { ok: false, reason: "Endpoint not found." }, origin);
}

// ── Start ────────────────────────────────────────────────
http.createServer(router).listen(PORT, () => {
  console.log(`
██╗   ██╗██╗  ████████╗██████╗  ██████╗ ███╗   ██╗
╚██╗ ██╔╝██║  ╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║
 ╚████╔╝ ██║     ██║   ██████╔╝██║   ██║██╔██╗ ██║
  ╚██╔╝  ██║     ██║   ██╔══██╗██║   ██║██║╚██╗██║
   ██║   ███████╗██║   ██║  ██║╚██████╔╝██║ ╚████║
   ╚═╝   ╚══════╝╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

ULTRON v1.8 — Voice + PWA + AI Router Foundation
Mode: SUPERVISED_AUTONOMY | Port: ${PORT}
AI Router: Level 0 (local) → 1 (Ollama) → 2 (Gemini) → 3 (OpenAI)
Provider: ${AI_PROVIDER || "none"} | OpenAI: ${OPENAI_KEY ? "KEY_PRESENT" : "NO_KEY"} | Gemini: ${GEMINI_KEY ? "KEY_PRESENT" : "NO_KEY"} | Claude: ${ANTHROPIC_KEY ? "KEY_PRESENT" : "NO_KEY"}
  `);
});
