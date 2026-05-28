const TOKEN = process.env.ULTRON_TOKEN || "ULTRON_LOCAL_OPERATOR_TOKEN";
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

const ULTRON_SYSTEM = `You are ULTRON — a powerful, strategic AI operator. Brilliant, direct, ruthlessly efficient.
Keep responses concise. Max 3 sentences unless asked for more.
Respond always in the same language the user writes in.`;

async function callGroq(message) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: "llama-3.1-8b-instant", max_tokens: 500, messages: [{ role: "system", content: ULTRON_SYSTEM }, { role: "user", content: message }] })
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, message: data.error?.message || "Groq error" };
  return { ok: true, provider: "groq", model: "llama-3.1-8b-instant", message: data.choices[0].message.content };
}

async function routeAI(message, model) {
  if (GROQ_KEY) { const r = await callGroq(message); if (r.ok) return r; }
  return { ok: true, provider: "local", message: "ULTRON online. Configura GROQ_API_KEY en Vercel." };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-ultron-token");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const url = (req.url || "").split("?")[0];

  if (url === "/api/health" || url.endsWith("/health")) {
    res.status(200).json({ ok: true, service: "ultron-backend", version: "v2.8", groq: GROQ_KEY ? "OK" : "NO_KEY", ts: new Date().toISOString() });
    return;
  }

  const token = req.headers["x-ultron-token"];
  if (!token || token !== TOKEN) { res.status(401).json({ ok: false, reason: "Invalid token" }); return; }

  if (req.method === "POST" && url.endsWith("/chat")) {
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
}
