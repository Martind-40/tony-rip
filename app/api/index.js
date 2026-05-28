// Vercel Serverless wrapper para ULTRON backend
const { classifyRequest } = require("../server/request_classifier.cjs");

const ALLOWED_ORIGINS = ["https://tony-rip-orpin.vercel.app", "http://localhost:5173", "http://localhost:3000"];

const TOKEN = process.env.ULTRON_TOKEN || "ULTRON_LOCAL_OPERATOR_TOKEN";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

const ROUTER_POLICY = {
  fallback_chain: ["openai", "gemini", "groq", "local"],
  classification_rules: {
    level0_max_chars: 20,
    level2_min_chars: 200,
    level3_min_chars: 500,
    level3_keywords: ["analizar","analyze","análisis","arquitectura","código","code","debug","decisión","strategy"],
    level2_keywords: ["resumen","summary","resumir","reunión","meeting","lista","traducir","translate"],
    level0_keywords: ["status","estado","health","version","help","ayuda"]
  }
};

const ULTRON_SYSTEM = `You are ULTRON — a powerful, strategic AI operator. Brilliant, direct, ruthlessly efficient.
Keep responses concise and impactful. Max 3 sentences unless asked for more.
Respond always in the same language the user writes in.`;

function cors(req, res) {
  const origin = req.headers.origin || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowed);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-ultron-token");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function estimateTokens(text) { return Math.ceil(String(text||"").length / 4); }

async function callGroq(message) {
  if (!GROQ_KEY) return { ok: false, message: "No GROQ key" };
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 500,
      messages: [{ role: "system", content: ULTRON_SYSTEM }, { role: "user", content: message }]
    })
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, message: data.error?.message || "Groq error" };
  return { ok: true, provider: "groq", model: "llama-3.1-8b-instant", message: data.choices[0].message.content };
}

async function callOpenAI(message) {
  if (!OPENAI_KEY) return { ok: false, message: "No OpenAI key" };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini", max_tokens: 500,
      messages: [{ role: "system", content: ULTRON_SYSTEM }, { role: "user", content: message }]
    })
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, message: data.error?.message || "OpenAI error" };
  return { ok: true, provider: "openai", model: "gpt-4o-mini", message: data.choices[0].message.content };
}

async function callGemini(message) {
  if (!GEMINI_KEY) return { ok: false, message: "No Gemini key" };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
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
  if (!res.ok) return { ok: false, message: data.error?.message || "Gemini error" };
  return { ok: true, provider: "gemini", model: "gemini-2.0-flash", message: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" };
}

async function routeAI(message, model) {
  const local_replies = {
    status: "ULTRON v2.8 online. AI Router active.",
    help: "Commands: /model openai · /model gemini · /model groq · /clear · /status",
    version: "ULTRON v2.8 — Vercel Serverless + AI Router"
  };
  const t = message.toLowerCase();
  for (const [k, v] of Object.entries(local_replies)) {
    if (t.includes(k)) return { ok: true, provider: "local", message: v };
  }

  if (model && model !== "auto") {
    if (model === "openai") return await callOpenAI(message);
    if (model === "gemini") return await callGemini(message);
    if (model === "groq") return await callGroq(message);
  }

  // Auto routing: intenta en orden hasta que uno funcione
  if (GROQ_KEY) { const r = await callGroq(message); if (r.ok) return r; }
  if (GEMINI_KEY) { const r = await callGemini(message); if (r.ok) return r; }
  if (OPENAI_KEY) { const r = await callOpenAI(message); if (r.ok) return r; }

  return { ok: true, provider: "local", message: "ULTRON online. Configure AI keys in Vercel Dashboard to enable AI responses." };
}

export default async function handler(req, res) {
  cors(req, res);

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const url = req.url.split("?")[0];

  // Health check — sin token
  if (url === "/api/health" || url === "/api/health/") {
    res.status(200).json({
      ok: true, service: "ultron-backend", version: "v2.8",
      mode: "VERCEL_SERVERLESS",
      openai: OPENAI_KEY ? "KEY_OK" : "NO_KEY",
      gemini: GEMINI_KEY ? "KEY_OK" : "NO_KEY",
      groq: GROQ_KEY ? "KEY_OK" : "NO_KEY",
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Token check para todo lo demás
  const token = req.headers["x-ultron-token"];
  if (!token || token !== TOKEN) {
    res.status(401).json({ ok: false, reason: "Invalid token" });
    return;
  }

  // Chat
  if (req.method === "POST" && url === "/api/chat") {
    const { message, model } = req.body || {};
    if (!message) { res.status(400).json({ ok: false, reason: "message required" }); return; }
    if (message === "/clear") { res.status(200).json({ ok: true, provider: "system", message: "Chat cleared.", action: "clear" }); return; }
    if (message.startsWith("/status")) { res.status(200).json({ ok: true, provider: "system", message: `ULTRON v2.8 — Groq:${GROQ_KEY?"OK":"NO"} Gemini:${GEMINI_KEY?"OK":"NO"} OpenAI:${OPENAI_KEY?"OK":"NO"}` }); return; }
    try {
      const result = await routeAI(message, model);
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ ok: false, message: e.message });
    }
    return;
  }

  res.status(404).json({ ok: false, reason: "Not found" });
}
