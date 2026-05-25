// ultron-backend.cjs — ULTRON v1.8
// AI Provider Router: Nivel 0 (local) → 1 (Ollama) → 2 (Gemini) → 3 (OpenAI)
// Node HTTP nativo. Sin Express. Sin dependencias externas.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { classifyRequest } = require("./request_classifier.cjs");

const PORT = process.env.PORT || 3001;
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const CONFIG_PATH = path.join(PROJECT_ROOT, "runtime", "runtime_config.json");
const CONSUMPTION_LOG_PATH = path.join(PROJECT_ROOT, "runtime", "consumption_log.json");
const ROUTER_POLICY_PATH = path.join(__dirname, "router_policy.json");
const MEMORY_ROOT = path.join(PROJECT_ROOT, "memory");
const WORKSPACE_ROOT = path.join(PROJECT_ROOT, "workspace");
const WORKSPACE_FOLDERS = ["meetings", "photos", "ideas", "reports", "archive"];
const READABLE_EXTENSIONS = [".md", ".txt", ".json", ".csv", ".log", ".html"];

function isInsideWorkspace(targetPath) {
  const resolved = path.resolve(targetPath);
  const wsRoot = path.resolve(WORKSPACE_ROOT);
  return resolved === wsRoot || resolved.startsWith(wsRoot + path.sep);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + "KB";
  return Math.round(bytes / (1024 * 1024)) + "MB";
}


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
function loadRouterPolicy() {
  try { return JSON.parse(fs.readFileSync(ROUTER_POLICY_PATH, "utf8")); }
  catch { return { fallback_chain: ["openai", "gemini", "ollama", "local"], classification_rules: {} }; }
}
const CONFIG = loadConfig();
const ROUTER_POLICY = loadRouterPolicy();
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

function checkLimits({ estimatedCost = 0, estimatedTokens = 0 } = {}) {
  const data = loadConsumptionLog();
  const today = new Date().toISOString().split("T")[0];
  const todayCalls = data.log.filter(e => e.timestamp?.startsWith(today)).length;
  const month = today.slice(0, 7);
  const monthCost = data.log
    .filter(e => e.timestamp?.startsWith(month))
    .reduce((s, e) => s + (e.cost_estimated || 0), 0);
  const limits = data.limits || {};
  const maxCallsPerDay = limits.max_calls_per_day ?? 50;
  const maxTokensPerRequest = limits.max_tokens_per_request ?? 2000;
  const maxDailyCostUsd = limits.max_daily_cost_usd ?? 1.00;
  const maxMonthlyBudgetUsd = limits.max_monthly_budget_usd ?? 20.00;
  if (todayCalls >= maxCallsPerDay) return { blocked: true, reason: "Daily call limit reached." };
  const todayCost = data.log.filter(e => e.timestamp?.startsWith(today)).reduce((s, e) => s + (e.cost_estimated || 0), 0);
  if (estimatedTokens > maxTokensPerRequest) return { blocked: true, reason: "Max tokens per request exceeded." };
  if (todayCost + estimatedCost > maxDailyCostUsd) return { blocked: true, reason: "Daily cost limit reached." };
  if (monthCost + estimatedCost > maxMonthlyBudgetUsd) return { blocked: true, reason: "Monthly budget limit reached." };
  const warnings = [];
  if (todayCost + estimatedCost >= maxDailyCostUsd * 0.8) warnings.push("Daily cost is at or above 80%.");
  if (monthCost + estimatedCost >= maxMonthlyBudgetUsd * 0.8) warnings.push("Monthly budget is at or above 80%.");
  return { blocked: false, warnings };
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || "").length / 4));
}

function estimateRequestCost(provider) {
  if (provider === "gemini") return 0.00001;
  if (provider === "openai") return 0.0001;
  if (provider === "claude") return 0.0001;
  return 0;
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

async function callOpenAI(message, meta = {}) {
  if (!OPENAI_KEY) return { ok: false, status: "OPENAI_PROVIDER_NOT_CONFIGURED", message: "OpenAI API key not configured." };
  const estimatedTokens = estimateTokens(message);
  const limit = checkLimits({ estimatedCost: estimateRequestCost("openai"), estimatedTokens });
  if (limit.blocked) return { ok: false, status: "LIMIT_REACHED", message: limit.reason };
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
    logConsumption({ provider: "openai", model: "gpt-4o-mini", tokens_used: tokens, cost_estimated: cost, call_type: "chat", approved_by: "chief_ui", ...meta });
    return { ok: true, provider: "openai", model: "gpt-4o-mini", message: data.choices[0].message.content, cost_estimated: cost, warning: limit.warnings?.[0] };
  } catch (e) {
    return { ok: false, status: "OPENAI_ERROR", message: e.message };
  }
}

async function callGemini(message, meta = {}) {
  if (!GEMINI_KEY) return { ok: false, status: "GEMINI_PROVIDER_NOT_CONFIGURED", message: "Gemini API key not configured." };
  const estimatedTokens = estimateTokens(message);
  const limit = checkLimits({ estimatedCost: estimateRequestCost("gemini"), estimatedTokens });
  if (limit.blocked) return { ok: false, status: "LIMIT_REACHED", message: limit.reason };
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
    logConsumption({ provider: "gemini", model: "gemini-flash", tokens_used: estimatedTokens, cost_estimated: estimateRequestCost("gemini"), call_type: "chat", approved_by: "chief_ui", ...meta });
    return { ok: true, provider: "gemini", model: "gemini-flash", message: text, cost_estimated: estimateRequestCost("gemini"), warning: limit.warnings?.[0] };
  } catch (e) {
    return { ok: false, status: "GEMINI_ERROR", message: e.message };
  }
}

async function callClaude(message, meta = {}) {
  if (!ANTHROPIC_KEY) return { ok: false, status: "CLAUDE_PROVIDER_NOT_CONFIGURED", message: "Anthropic API key not configured." };
  const estimatedTokens = estimateTokens(message);
  const limit = checkLimits({ estimatedCost: estimateRequestCost("claude"), estimatedTokens });
  if (limit.blocked) return { ok: false, status: "LIMIT_REACHED", message: limit.reason };
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
    logConsumption({ provider: "claude", model: "claude-sonnet-4-5", tokens_used: tokens, cost_estimated: 0, call_type: "chat", approved_by: "chief_ui", ...meta });
    return { ok: true, provider: "claude", model: "claude-sonnet-4-5", message: data.content[0].text, cost_estimated: 0, warning: limit.warnings?.[0] };
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

function providerAvailable(provider) {
  if (provider === "local") return true;
  if (provider === "ollama") return !IS_VERCEL;
  if (provider === "gemini") return Boolean(GEMINI_KEY);
  if (provider === "openai") return Boolean(OPENAI_KEY);
  if (provider === "claude") return Boolean(ANTHROPIC_KEY);
  return false;
}

function providerLevel(provider) {
  if (provider === "local") return 0;
  if (provider === "ollama") return 1;
  if (provider === "gemini") return 2;
  if (provider === "openai") return 3;
  return 0;
}

function explicitClassification(provider) {
  const normalized = provider === "local_rules" ? "local" : provider;
  return {
    level: providerLevel(normalized),
    provider: normalized,
    reason: `explicit provider: ${normalized}`,
    cost_tier: normalized === "local" || normalized === "ollama" ? "free" : normalized === "gemini" ? "cheap" : "paid"
  };
}

function chooseFallback(classification) {
  if (providerAvailable(classification.provider)) return classification;
  for (const provider of ROUTER_POLICY.fallback_chain || ["openai", "gemini", "ollama", "local"]) {
    const level = providerLevel(provider);
    if (level <= classification.level && providerAvailable(provider)) {
      return {
        level,
        provider,
        reason: `${classification.reason}; fallback from ${classification.provider} to ${provider}`,
        cost_tier: provider === "local" || provider === "ollama" ? "free" : provider === "gemini" ? "cheap" : "paid"
      };
    }
  }
  return {
    level: 0,
    provider: "local",
    reason: `${classification.reason}; no provider key available, forced local stub`,
    cost_tier: "free"
  };
}

function localRouterResult(message, classification) {
  const response = localRulesResponse(message) || "Local rules handled this request. No API call executed.";
  logConsumption({
    provider: "local_rules",
    model: "level0",
    tokens_used: 0,
    cost_estimated: 0,
    call_type: "local_rule",
    approved_by: "router",
    level: 0,
    classification_reason: classification.reason
  });
  return {
    ok: true,
    provider: "local_rules",
    model: "level0",
    level: 0,
    classification_reason: classification.reason,
    cost_estimated: 0,
    message: response
  };
}

async function routeToAI(message, requestedModel, options = {}) {
  const shouldAuto = !requestedModel || requestedModel === "auto";
  const initial = shouldAuto
    ? classifyRequest(message, { policy: ROUTER_POLICY, sensitive: Boolean(options.sensitive) })
    : explicitClassification(requestedModel);
  const classification = chooseFallback(initial);

  if (classification.provider === "local") return localRouterResult(message, classification);
  if (classification.provider === "ollama") {
    const result = routeOllamaLocal();
    logConsumption({
      provider: "ollama",
      model: result.model || "local-private-stub",
      tokens_used: 0,
      cost_estimated: 0,
      call_type: "local_provider_stub",
      approved_by: "router",
      level: 1,
      classification_reason: classification.reason
    });
    return { ...result, level: 1, classification_reason: classification.reason, cost_estimated: 0 };
  }

  const estimatedTokens = estimateTokens(message);
  const estimatedCost = estimateRequestCost(classification.provider);
  const guard = checkLimits({ estimatedCost, estimatedTokens });
  if (guard.blocked) {
    return {
      ok: false,
      status: "LIMIT_REACHED",
      provider: classification.provider,
      level: classification.level,
      classification_reason: classification.reason,
      cost_estimated: estimatedCost,
      message: guard.reason
    };
  }

  const meta = { level: classification.level, classification_reason: classification.reason };
  const result = classification.provider === "openai"
    ? await callOpenAI(message, meta)
    : classification.provider === "gemini"
      ? await callGemini(message, meta)
      : await callClaude(message, meta);

  return {
    ...result,
    level: classification.level,
    classification_reason: classification.reason,
    cost_estimated: result.cost_estimated ?? estimatedCost,
    warning: result.warning || guard.warnings?.[0]
  };
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

    const result = await routeToAI(message, model || null, { sensitive: Boolean(body.sensitive) });
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


  // GET /api/workspace/list/:folder
  if (method === "GET" && url.startsWith("/api/workspace/list/")) {
    if (!requireToken(req, res, origin)) return;
    const folder = url.replace("/api/workspace/list/", "").split("?")[0];
    if (!WORKSPACE_FOLDERS.includes(folder)) {
      send(res, 403, { ok: false, blocked: true, reason: `Folder '${folder}' not in workspace whitelist.` }, origin);
      return;
    }
    const folderPath = path.join(WORKSPACE_ROOT, folder);
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });
      const items = entries
        .filter(e => e.isFile() && !e.name.startsWith("."))
        .map(e => {
          const filePath = path.join(folderPath, e.name);
          const stats = fs.statSync(filePath);
          const ext = path.extname(e.name).toLowerCase();
          return {
            name: e.name,
            size: formatFileSize(stats.size),
            modified: stats.mtime.toISOString().split("T")[0],
            readable: READABLE_EXTENSIONS.includes(ext),
            extension: ext
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      addLog("workspace_list", { folder, count: items.length });
      send(res, 200, { ok: true, folder, path: `workspace/${folder}`, count: items.length, items }, origin);
    } catch (err) {
      send(res, 500, { ok: false, reason: err.message }, origin);
    }
    return;
  }

  // GET /api/workspace/file/:folder/:filename
  if (method === "GET" && url.startsWith("/api/workspace/file/")) {
    if (!requireToken(req, res, origin)) return;
    const parts = url.replace("/api/workspace/file/", "").split("/");
    const folder = parts[0];
    const filename = decodeURIComponent(parts.slice(1).join("/"));

    if (!WORKSPACE_FOLDERS.includes(folder)) {
      send(res, 403, { ok: false, blocked: true, reason: "Folder not in whitelist." }, origin);
      return;
    }

    const dangerous = ["../", ".env", "secret", "key", "token", "credential", "password"];
    for (const d of dangerous) {
      if (filename.toLowerCase().includes(d)) {
        send(res, 403, { ok: false, blocked: true, reason: "Access denied." }, origin);
        return;
      }
    }

    const filePath = path.join(WORKSPACE_ROOT, folder, filename);
    if (!isInsideWorkspace(filePath)) {
      send(res, 403, { ok: false, blocked: true, reason: "Path outside workspace." }, origin);
      return;
    }

    const ext = path.extname(filename).toLowerCase();
    if (!READABLE_EXTENSIONS.includes(ext)) {
      send(res, 403, { ok: false, blocked: true, reason: `Extension '${ext}' not readable.` }, origin);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      addLog("workspace_read", { folder, file: filename });
      send(res, 200, { ok: true, folder, file: filename, content, size: formatFileSize(content.length) }, origin);
    } catch {
      send(res, 404, { ok: false, reason: `File not found: ${filename}` }, origin);
    }
    return;
  }


  // POST /api/meeting/process
  if (method === "POST" && url === "/api/meeting/process") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const { title, notes, save } = body;

    if (!notes || !notes.trim()) {
      send(res, 400, { ok: false, reason: "notes required." }, origin);
      return;
    }

    // Sensitivity check
    const SENSITIVE = [/\bpassword\b/gi, /\bcontraseña\b/gi, /\btoken\b/gi, /sk-[a-zA-Z0-9]+/g, /api[_-]?key/gi];
    const found = SENSITIVE.flatMap(p => notes.match(p) || []);
    if (found.length > 0) {
      send(res, 403, { ok: false, blocked: true, reason: "Sensitive data detected. Remove before processing.", detected: found.slice(0, 3) }, origin);
      return;
    }

    const meetingPrompt = `You are ULTRON — a precise knowledge operator analyzing meeting notes.

Extract and structure the following from these meeting notes:

1. EXECUTIVE SUMMARY (3-5 sentences, key outcomes only)
2. DECISIONS MADE (bullet list, specific decisions taken)
3. ACTION ITEMS (bullet list, format: task - responsible person if mentioned - deadline if mentioned)
4. RISKS IDENTIFIED (bullet list, issues or blockers mentioned)
5. NEXT STEPS (bullet list, immediate follow-up actions)
6. OPEN QUESTIONS (bullet list, unresolved questions)

Meeting title: ${title || "Untitled Meeting"}
Date: ${new Date().toISOString().split("T")[0]}

Meeting notes:
${notes.slice(0, 2000)}

Respond in the same language as the meeting notes. Be concise and actionable. Use the exact section headers above.`;

    let result = null;
    let provider = "local";

    try {
      const aiResult = await routeToAI(meetingPrompt, null);
      if (aiResult.ok) {
        result = aiResult.message;
        provider = aiResult.provider;
      }
    } catch { /* fall through to local */ }

    // Local fallback extraction
    if (!result) {
      const lines = notes.split(/[\n.!?]+/).filter(l => l.trim().length > 10);
      const tasks = lines.filter(l => /\b(hacer|do|task|tarea|completar|revisar|enviar|crear|check|follow|asignar|assign)\b/i.test(l)).slice(0, 5);
      const decisions = lines.filter(l => /\b(decidimos|decided|acordamos|agreed|confirmamos|confirmed|aprobamos|approved)\b/i.test(l)).slice(0, 3);
      const risks = lines.filter(l => /\b(riesgo|risk|problema|issue|blocker|bloqueo|concern|preocupación)\b/i.test(l)).slice(0, 3);
      const questions = lines.filter(l => /\?/.test(l)).slice(0, 3);

      result = `## EXECUTIVE SUMMARY\n${lines.slice(0, 3).join(". ").slice(0, 400)}\n\n## DECISIONS MADE\n${decisions.length ? decisions.map(d => "- " + d.trim()).join("\n") : "- No explicit decisions detected"}\n\n## ACTION ITEMS\n${tasks.length ? tasks.map(t => "- " + t.trim()).join("\n") : "- No action items detected"}\n\n## RISKS IDENTIFIED\n${risks.length ? risks.map(r => "- " + r.trim()).join("\n") : "- No risks detected"}\n\n## NEXT STEPS\n${tasks.slice(0, 2).map(t => "- " + t.trim()).join("\n") || "- Review and assign action items"}\n\n## OPEN QUESTIONS\n${questions.length ? questions.map(q => "- " + q.trim()).join("\n") : "- None detected"}`;
      provider = "local_extraction";
    }

    // Save to workspace/meetings/ if requested
    let savedFile = null;
    if (save) {
      try {
        const meetingsPath = path.join(PROJECT_ROOT, "workspace", "meetings");
        if (!fs.existsSync(meetingsPath)) fs.mkdirSync(meetingsPath, { recursive: true });
        const date = new Date().toISOString().split("T")[0];
        const slug = (title || "meeting").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
        const filename = `${date}-${slug}.md`;
        const filePath = path.join(meetingsPath, filename);
        const fileContent = `# ${title || "Meeting"} — ${date}\n\n${result}\n\n---\n*Processed by ULTRON v2.7 — ${provider}*\n`;
        fs.writeFileSync(filePath, fileContent);
        savedFile = filename;
      } catch (e) {
        savedFile = null;
      }
    }

    addLog("meeting_process", { title, provider, saved: !!savedFile });
    send(res, 200, { ok: true, provider, title, date: new Date().toISOString().split("T")[0], result, savedFile }, origin);
    return;
  }


  // POST /api/photo/analyze
  if (method === "POST" && url === "/api/photo/analyze") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const { filename, description, category, save, base64 } = body;

    if (!filename || !filename.trim()) {
      send(res, 400, { ok: false, reason: "filename required." }, origin);
      return;
    }

    // Block dangerous filenames
    const dangerous = ["../", ".env", "secret", "key", "token", "password"];
    for (const d of dangerous) {
      if (filename.toLowerCase().includes(d)) {
        send(res, 403, { ok: false, blocked: true, reason: "Access denied." }, origin);
        return;
      }
    }

    const date = new Date().toISOString().split("T")[0];
    const VALID_CATEGORIES = ["meeting", "idea", "field", "document", "benchmark", "evidence", "other"];
    const safeCategory = VALID_CATEGORIES.includes(category) ? category : "other";

    let result = null;
    let provider = "local";

    // If AI has vision capability and base64 provided, analyze image
    if (base64 && (OPENAI_KEY || ANTHROPIC_KEY)) {
      try {
        if (OPENAI_KEY) {
          const res2 = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              max_tokens: 500,
              messages: [{
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
                  { type: "text", text: `You are ULTRON analyzing a field capture. Category: ${safeCategory}.\n\nExtract:\n1. DESCRIPTION (what you see)\n2. KEY IDEAS (actionable insights)\n3. TASKS DETECTED (if any)\n4. CLASSIFICATION (type of content)\n5. NEXT STEPS (suggested actions)\n\nBe concise and actionable.` }
                ]
              }]
            })
          });
          const data = await res2.json();
          if (res2.ok) {
            result = data.choices[0].message.content;
            provider = "openai_vision";
            const tokens = data.usage?.total_tokens || 0;
            logConsumption({ provider: "openai", model: "gpt-4o-mini", tokens_used: tokens, cost_estimated: Math.round((tokens / 1000000) * 150 * 10000) / 10000, call_type: "vision" });
          }
        }
      } catch { /* fall through to local */ }
    }

    // Local fallback — use description if provided
    if (!result) {
      const desc = description || filename;
      result = `## DESCRIPTION\n${desc}\n\n## KEY IDEAS\n- Visual capture requiring manual review\n- Category: ${safeCategory}\n\n## TASKS DETECTED\n- Review and classify this capture\n- Extract relevant information manually\n\n## CLASSIFICATION\n- Type: ${safeCategory}\n- File: ${filename}\n- Date: ${date}\n\n## NEXT STEPS\n- Open file and review content\n- Distill key insights to knowledge layer`;
      provider = description ? "local_with_description" : "local_metadata_only";
    }

    // Save analysis to workspace/photos/
    let savedFile = null;
    if (save) {
      try {
        const photosPath = path.join(PROJECT_ROOT, "workspace", "photos");
        if (!fs.existsSync(photosPath)) fs.mkdirSync(photosPath, { recursive: true });
        const slug = filename.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
        const analysisFilename = `${date}-${slug}-analysis.md`;
        const filePath = path.join(photosPath, analysisFilename);
        const fileContent = `# Photo Analysis — ${filename}\nDate: ${date} | Category: ${safeCategory}\n\n${result}\n\n---\n*Processed by ULTRON v2.7 — ${provider}*\n`;
        fs.writeFileSync(filePath, fileContent);
        savedFile = analysisFilename;
      } catch { savedFile = null; }
    }

    addLog("photo_analyze", { filename, category: safeCategory, provider, saved: !!savedFile });
    send(res, 200, { ok: true, provider, filename, category: safeCategory, date, result, savedFile }, origin);
    return;
  }


  // GET /api/session/load
  if (method === "GET" && url === "/api/session/load") {
    if (!requireToken(req, res, origin)) return;
    const sessionPath = path.join(PROJECT_ROOT, "runtime", "session_state.json");
    try {
      if (!fs.existsSync(sessionPath)) {
        send(res, 200, { ok: true, exists: false, state: null }, origin);
        return;
      }
      const state = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
      send(res, 200, { ok: true, exists: true, state, savedAt: state._savedAt || null }, origin);
    } catch (err) {
      send(res, 500, { ok: false, reason: "Failed to load session: " + err.message }, origin);
    }
    return;
  }

  // POST /api/session/save
  if (method === "POST" && url === "/api/session/save") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const { state } = body;

    if (!state || typeof state !== "object") {
      send(res, 400, { ok: false, reason: "state object required." }, origin);
      return;
    }

    // Security: strip any sensitive fields before saving
    const BLOCKED_KEYS = ["password", "token", "key", "secret", "credential", "apiKey"];
    function stripSensitive(obj, depth = 0) {
      if (depth > 5) return obj;
      if (typeof obj !== "object" || obj === null) return obj;
      const clean = Array.isArray(obj) ? [] : {};
      for (const [k, v] of Object.entries(obj)) {
        if (BLOCKED_KEYS.some(bk => k.toLowerCase().includes(bk))) continue;
        clean[k] = typeof v === "object" ? stripSensitive(v, depth + 1) : v;
      }
      return clean;
    }

    const cleanState = stripSensitive(state);
    cleanState._savedAt = new Date().toISOString();
    cleanState._version = "v2.7";

    const sessionPath = path.join(PROJECT_ROOT, "runtime", "session_state.json");
    try {
      fs.writeFileSync(sessionPath, JSON.stringify(cleanState, null, 2));
      addLog("session_save", { keys: Object.keys(cleanState).length });
      send(res, 200, { ok: true, savedAt: cleanState._savedAt, keys: Object.keys(cleanState).length }, origin);
    } catch (err) {
      send(res, 500, { ok: false, reason: "Failed to save session: " + err.message }, origin);
    }
    return;
  }

  // DELETE /api/session/clear
  if (method === "DELETE" && url === "/api/session/clear") {
    if (!requireToken(req, res, origin)) return;
    const sessionPath = path.join(PROJECT_ROOT, "runtime", "session_state.json");
    try {
      if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
      addLog("session_clear", {});
      send(res, 200, { ok: true, message: "Session cleared." }, origin);
    } catch (err) {
      send(res, 500, { ok: false, reason: err.message }, origin);
    }
    return;
  }


  // POST /api/knowledge/distill
  if (method === "POST" && url === "/api/knowledge/distill") {
    if (!requireToken(req, res, origin)) return;
    const body = await parseBody(req);
    const { content, type, source, approved } = body;

    if (!content || !content.trim()) {
      send(res, 400, { ok: false, reason: "content required." }, origin);
      return;
    }

    const VALID_TYPES = ["learning", "pattern", "decision", "insight", "task"];
    const VALID_SOURCES = ["meeting", "photo", "idea", "report", "manual"];
    const safeType = VALID_TYPES.includes(type) ? type : "learning";
    const safeSource = VALID_SOURCES.includes(source) ? source : "manual";

    // Sensitivity check
    const SENSITIVE = [/\bpassword\b/gi, /\bcontraseña\b/gi, /\btoken\b/gi, /sk-[a-zA-Z0-9]+/g, /api[_-]?key/gi, /\bcredential\b/gi];
    const found = SENSITIVE.flatMap(p => content.match(p) || []);
    if (found.length > 0) {
      send(res, 403, { ok: false, blocked: true, reason: "Sensitive data detected. Remove before distilling.", detected: found.slice(0, 3) }, origin);
      return;
    }

    // Distill with AI if available
    let distilled = content.trim();
    let provider = "local";

    try {
      const prompt = `You are ULTRON Knowledge Distiller. Extract pure reusable knowledge from this input.
Type: ${safeType} | Source: ${safeSource}

Rules:
- Remove all sensitive data (names, credentials, private details)
- Extract only the reusable insight or lesson
- Be concise: 1-3 sentences maximum
- No markdown, no bullets — plain text only
- Same language as input

Input: "${content.slice(0, 800)}"

Return only the distilled knowledge:`;

      const aiResult = await routeToAI(prompt, null);
      if (aiResult.ok && aiResult.provider !== "local_rules") {
        distilled = aiResult.message.trim();
        provider = aiResult.provider;
      }
    } catch { /* use original */ }

    // If not yet approved, return for human review
    if (!approved) {
      send(res, 200, {
        ok: true,
        status: "PENDING_APPROVAL",
        distilled,
        provider,
        type: safeType,
        source: safeSource,
        message: "Review distilled content and resubmit with approved: true to save."
      }, origin);
      return;
    }

    // Save to knowledge/distilled_lessons.md
    const date = new Date().toISOString().split("T")[0];
    const time = new Date().toISOString();
    const entry = `
## [${safeType.toUpperCase()}] ${date}
- **Source**: ${safeSource}
- **Provider**: ${provider}
- **Status**: APPROVED
- **Content**: ${distilled}
- **Saved**: ${time}

`;

    try {
      const knowledgePath = path.join(PROJECT_ROOT, "knowledge", "distilled_lessons.md");
      if (!fs.existsSync(path.dirname(knowledgePath))) {
        fs.mkdirSync(path.dirname(knowledgePath), { recursive: true });
      }
      fs.appendFileSync(knowledgePath, entry);
      addLog("knowledge_distill", { type: safeType, source: safeSource, provider, approved: true });
      send(res, 200, { ok: true, status: "SAVED", distilled, provider, type: safeType, source: safeSource, savedAt: time }, origin);
    } catch (err) {
      send(res, 500, { ok: false, reason: "Failed to save: " + err.message }, origin);
    }
    return;
  }

  // GET /api/knowledge/list
  if (method === "GET" && url === "/api/knowledge/list") {
    if (!requireToken(req, res, origin)) return;
    const knowledgePath = path.join(PROJECT_ROOT, "knowledge", "distilled_lessons.md");
    try {
      if (!fs.existsSync(knowledgePath)) {
        send(res, 200, { ok: true, count: 0, entries: [], raw: "" }, origin);
        return;
      }
      const raw = fs.readFileSync(knowledgePath, "utf8");
      // Parse entries
      const entries = [];
      const blocks = raw.split(/^## /m).filter(b => b.trim());
      for (const block of blocks) {
        const typeMatch = block.match(/^\[([A-Z]+)\]/);
        const dateMatch = block.match(/\d{4}-\d{2}-\d{2}/);
        const contentMatch = block.match(/\*\*Content\*\*: (.+)/);
        const sourceMatch = block.match(/\*\*Source\*\*: (.+)/);
        if (typeMatch && contentMatch) {
          entries.push({
            type: typeMatch[1].toLowerCase(),
            date: dateMatch ? dateMatch[0] : "unknown",
            content: contentMatch[1].trim(),
            source: sourceMatch ? sourceMatch[1].trim() : "unknown"
          });
        }
      }
      send(res, 200, { ok: true, count: entries.length, entries: entries.slice(0, 50) }, origin);
    } catch (err) {
      send(res, 500, { ok: false, reason: err.message }, origin);
    }
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
