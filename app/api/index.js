const { classifyRequest } = require("../server/request_classifier.cjs");

const TOKEN = process.env.ULTRON_TOKEN || "ULTRON_LOCAL_OPERATOR_TOKEN";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

const ALLOWED_ORIGINS = [
  "https://tony-rip-orpin.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

const ULTRON_SYSTEM = `You are ULTRON — a powerful, strategic AI operator. Brilliant, direct, ruthlessly efficient.
Keep responses concise and impactful. Max 3 sentences unless asked for more.
Respond always in the same language the user writes in.`;

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
  const t = message.toLowerCase().trim();
  if (t.length < 20 || t === "/status" || t.includes("status") || t.includes("version")) {
    return { ok: true, provider: "local", message: `ULTRON v2.8 online. Groq:${GROQ_KEY?"OK":"NO"} Gemini:${GEMINI_KEY?"OK":"NO"} OpenAI:${OPENAI_KEY?"OK":"NO"}` };
  }

  if (model && model !== "auto") {
    if (model === "openai") return callOpenAI(message);
    if (model === "gemini") return callGemini(message);
    if (model === "groq") return callGroq(message);
  }

  if (GROQ_KEY) { const r = await callGroq(message); if (r.ok) return r; }
  if (GEMINI_KEY) { const r = await callGemini(message); if (r.ok) return r; }
  if (OPENAI_KEY) { const r = await callOpenAI(message); if (r.ok) return r; }

  return { ok: true, provider: "local", message: "ULTRON online. Sin keys AI configuradas." };
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-ultron-token");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const url = (req.url || "").split("?")[0];

  if (url === "/api/health" || url === "/api/health/") {
    res.status(200).json({
      ok: true, service: "ultron-backend", version: "v2.8",
      mode: "VERCEL_SERVERLESS",
      groq: GROQ_KEY ? "KEY_OK" : "NO_KEY",
      openai: OPENAI_KEY ? "KEY_OK" : "NO_KEY",
      gemini: GEMINI_KEY ? "KEY_OK" : "NO_KEY",
      timestamp: new Date().toISOString()
    });
    return;
  }

  const token = req.headers["x-ultron-token"];
  if (!token || token !== TOKEN) {
    res.status(401).json({ ok: false, reason: "Invalid token" });
    return;
  }

  if (req.method === "POST" && url === "/api/chat") {
    const body = req.body || {};
    const message = (body.message || "").trim();
    const model = (body.model || "").toLowerCase();
    if (!message) { res.status(400).json({ ok: false, reason: "message required" }); return; }
    if (message === "/clear") { res.status(200).json({ ok: true, provider: "system", message: "Chat cleared.", action: "clear" }); return; }
    try {
      const result = await routeAI(message, model);
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ ok: false, message: e.message });
    }
    return;
  }

  res.status(404).json({ ok: false, reason: "Not found" });
};
