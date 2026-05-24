import React, { useState } from "react";

const C = {
  bg1: "#0d0d0d", bg2: "#111", bg3: "#0a0a0a",
  border: "#1e1e1e", border2: "#2a2a2a",
  red: "#c0392b", redGlow: "rgba(192,57,43,0.15)",
  text: "#e8e8e8", textDim: "#888", textFaint: "#444",
  green: "#27ae60", amber: "#e67e22",
  fontMono: "'Share Tech Mono', monospace"
};

const TOKEN = "ULTRON_LOCAL_OPERATOR_TOKEN";
const BACKEND = "http://localhost:3001";

function authFetch(path, opts = {}) {
  return fetch(`${BACKEND}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", "x-ultron-token": TOKEN, ...(opts.headers || {}) }
  });
}

const SENSITIVITY_PATTERNS = [
  /\b(password|contraseña|clave|token|api.?key|secret)\b/gi,
  /\b(tarjeta|credit.?card|cvv|cuenta bancaria)\b/gi,
  /\bsk-[a-zA-Z0-9]+/g,
  /\b[A-Z0-9]{20,}\b/g
];

function sensitivityCheck(text) {
  const found = [];
  for (const pattern of SENSITIVITY_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) found.push(...matches);
  }
  return found;
}

function localDistill(text) {
  const lines = text.split(/[\n.!?]+/).filter(l => l.trim().length > 10);
  const tasks = lines.filter(l => /\b(hacer|do|task|tarea|completar|revisar|enviar|crear|check|follow)\b/i.test(l)).slice(0, 5);
  const decisions = lines.filter(l => /\b(decidimos|decided|acordamos|agreed|confirmamos|confirmed)\b/i.test(l)).slice(0, 3);
  const risks = lines.filter(l => /\b(riesgo|risk|problema|issue|blocker|bloqueo|concern)\b/i.test(l)).slice(0, 3);
  return {
    summary: lines.slice(0, 3).join(". ").slice(0, 300),
    tasks: tasks.map(t => t.trim().slice(0, 120)),
    decisions: decisions.map(d => d.trim().slice(0, 120)),
    risks: risks.map(r => r.trim().slice(0, 120)),
    next_steps: tasks.slice(0, 2).map(t => t.trim().slice(0, 100))
  };
}

export default function MeetingPanel({ backendOnline }) {
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [sensitiveWarning, setSensitiveWarning] = useState([]);
  const [approved, setApproved] = useState(false);

  function checkSensitivity() {
    const found = sensitivityCheck(input);
    setSensitiveWarning(found);
    return found.length === 0;
  }

  async function processMeeting() {
    if (!input.trim()) return;
    const clean = checkSensitivity();
    if (!clean) return;
    setProcessing(true);
    setResult(null);

    try {
      if (backendOnline) {
        const prompt = `Analyze this meeting notes and extract:
1. Executive summary (3-5 sentences)
2. Tasks detected (list)
3. Decisions made (list)
4. Risks identified (list)
5. Next steps (list)

Meeting: "${input.slice(0, 1500)}"

Respond in the same language as the meeting notes. Be concise.`;

        const res = await authFetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ message: prompt, model: "auto" })
        });
        const data = await res.json();
        if (data.ok) {
          setResult({ type: "ai", content: data.message, provider: data.provider });
        } else {
          setResult({ type: "local", ...localDistill(input) });
        }
      } else {
        setResult({ type: "local", ...localDistill(input) });
      }
    } catch {
      setResult({ type: "local", ...localDistill(input) });
    }
    setProcessing(false);
  }

  function approveSave() {
    setApproved(true);
    // In v2.2+ this would save to knowledge/distilled_lessons.md via backend
  }

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 09 / MEETING INTELLIGENCE</div>
      <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 12, fontFamily: C.fontMono }}>MEETING PROCESSOR</div>

      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Meeting title..."
        style={{ width: "100%", background: C.bg2, border: `0.5px solid ${C.border2}`, borderRadius: 4, padding: "8px 12px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", marginBottom: 8 }} />

      <textarea value={input} onChange={e => { setInput(e.target.value); setSensitiveWarning([]); setResult(null); setApproved(false); }}
        placeholder="Paste meeting notes, transcript, or audio summary here...&#10;&#10;ULTRON will extract: summary · tasks · decisions · risks · next steps"
        style={{ width: "100%", background: C.bg2, border: `0.5px solid ${C.border2}`, borderRadius: 4, padding: "10px 12px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", minHeight: 120, resize: "vertical", lineHeight: 1.6 }} />

      {sensitiveWarning.length > 0 && (
        <div style={{ background: "#1a0505", border: `0.5px solid #5a1010`, borderRadius: 4, padding: "8px 10px", marginTop: 8 }}>
          <div style={{ fontSize: 10, color: C.red, fontFamily: C.fontMono, marginBottom: 4 }}>⚠ SENSITIVE DATA DETECTED</div>
          <div style={{ fontSize: 9, color: "#888", fontFamily: C.fontMono }}>Remove before processing: {sensitiveWarning.slice(0, 3).join(", ")}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={processMeeting} disabled={processing || !input.trim()} style={{
          flex: 1, background: C.red, border: "none", borderRadius: 4, color: "#fff",
          fontFamily: C.fontMono, fontSize: 11, padding: "10px", cursor: processing ? "not-allowed" : "pointer",
          opacity: processing || !input.trim() ? 0.5 : 1, minHeight: 44
        }}>
          {processing ? "PROCESSING..." : "▶ PROCESS MEETING"}
        </button>
        <button onClick={() => { setInput(""); setTitle(""); setResult(null); setSensitiveWarning([]); setApproved(false); }} style={{
          background: "transparent", border: `0.5px solid ${C.border2}`, borderRadius: 4, color: C.textDim,
          fontFamily: C.fontMono, fontSize: 11, padding: "10px 14px", cursor: "pointer", minHeight: 44
        }}>✕ CLEAR</button>
      </div>

      {result && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 9, color: result.type === "ai" ? C.green : C.amber, fontFamily: C.fontMono, marginBottom: 8 }}>
            {result.type === "ai" ? `✓ AI PROCESSED [${result.provider}]` : "✓ LOCAL PROCESSED"}
          </div>

          {result.type === "ai" ? (
            <div style={{ background: C.bg3, borderRadius: 4, padding: "10px 12px", border: `0.5px solid ${C.border}`, fontSize: 12, color: "#aaa", fontFamily: C.fontMono, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {result.content}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "SUMMARY", items: [result.summary], color: C.text },
                { label: "TASKS", items: result.tasks, color: C.amber },
                { label: "DECISIONS", items: result.decisions, color: C.green },
                { label: "RISKS", items: result.risks, color: C.red },
                { label: "NEXT STEPS", items: result.next_steps, color: C.textDim }
              ].map(section => section.items?.length > 0 && (
                <div key={section.label} style={{ background: C.bg3, borderRadius: 4, padding: "8px 10px", border: `0.5px solid ${C.border}` }}>
                  <div style={{ fontSize: 9, color: section.color, fontFamily: C.fontMono, marginBottom: 4 }}>{section.label}</div>
                  {section.items.map((item, i) => <div key={i} style={{ fontSize: 11, color: "#888", fontFamily: C.fontMono, padding: "2px 0", lineHeight: 1.5 }}>· {item}</div>)}
                </div>
              ))}
            </div>
          )}

          {!approved ? (
            <button onClick={approveSave} style={{
              marginTop: 10, width: "100%", background: "#0a1f0a", border: `0.5px solid ${C.green}`,
              borderRadius: 4, color: C.green, fontFamily: C.fontMono, fontSize: 11,
              padding: "9px", cursor: "pointer", minHeight: 44
            }}>✓ APPROVE & SAVE TO KNOWLEDGE LAYER</button>
          ) : (
            <div style={{ marginTop: 10, padding: "8px 10px", background: "#0a1f0a", borderRadius: 4, border: `0.5px solid ${C.green}`, fontSize: 10, color: C.green, fontFamily: C.fontMono }}>
              ✓ APPROVED — Saved to knowledge/distilled_lessons.md (v2.2+)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
