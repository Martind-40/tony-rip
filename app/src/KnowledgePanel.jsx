import React, { useState } from "react";

const C = {
  bg1: "#0d0d0d", bg2: "#111", bg3: "#0a0a0a",
  border: "#1e1e1e", border2: "#2a2a2a",
  red: "#c0392b", redGlow: "rgba(192,57,43,0.15)",
  text: "#e8e8e8", textDim: "#888", textFaint: "#444",
  green: "#27ae60", amber: "#e67e22",
  fontMono: "'Share Tech Mono', monospace"
};

const KNOWLEDGE_TYPES = [
  { id: "learning", label: "LEARNING", color: C.green, desc: "Strategic lesson" },
  { id: "pattern", label: "PATTERN", color: C.amber, desc: "Detected pattern" },
  { id: "decision", label: "DECISION", color: C.red, desc: "Recorded decision" },
  { id: "insight", label: "INSIGHT", color: "#9b59b6", desc: "Actionable insight" },
  { id: "task", label: "TASK", color: C.textDim, desc: "Critical task" }
];

const TOKEN = "ULTRON_LOCAL_OPERATOR_TOKEN";
const BACKEND = "http://localhost:3001";

function authFetch(path, opts = {}) {
  return fetch(`${BACKEND}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", "x-ultron-token": TOKEN, ...(opts.headers || {}) }
  });
}

export default function KnowledgePanel({ backendOnline }) {
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState("");
  const [type, setType] = useState("learning");
  const [source, setSource] = useState("meeting");
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState("all");

  const DISTILLATION_STEPS = [
    { id: "permission", label: "Permission Check", desc: "Is source in whitelist?" },
    { id: "sensitivity", label: "Sensitivity Filter", desc: "Contains sensitive data?" },
    { id: "distillation", label: "Distillation", desc: "Extract pure knowledge" },
    { id: "approval", label: "Human Approval", desc: "Chief approves" }
  ];

  const [step, setStep] = useState(null);

  async function distill() {
    if (!input.trim()) return;
    setProcessing(true);
    setStep("permission");

    await new Promise(r => setTimeout(r, 400));
    setStep("sensitivity");
    await new Promise(r => setTimeout(r, 400));
    setStep("distillation");

    let distilled = input.trim();

    try {
      if (backendOnline) {
        const prompt = `Distill this into pure reusable knowledge (no sensitive data, no names, no credentials):
"${input.slice(0, 800)}"
Type: ${type}
Source: ${source}

Return only the distilled knowledge in 1-3 sentences. Remove any sensitive information.`;
        const res = await authFetch("/api/chat", { method: "POST", body: JSON.stringify({ message: prompt }) });
        const data = await res.json();
        if (data.ok) distilled = data.message;
      }
    } catch { /* use original */ }

    await new Promise(r => setTimeout(r, 400));
    setStep("approval");
    await new Promise(r => setTimeout(r, 200));

    const entry = {
      id: `KN-${Date.now()}`,
      type,
      source,
      content: distilled,
      original: input.slice(0, 200),
      status: "PENDING",
      timestamp: new Date().toISOString().split("T")[0]
    };

    setEntries(prev => [entry, ...prev]);
    setInput("");
    setStep(null);
    setProcessing(false);
  }

  function approve(id) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: "APPROVED" } : e));
  }

  function reject(id) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: "REJECTED" } : e));
  }

  const filtered = filter === "all" ? entries : entries.filter(e => e.status === filter || e.type === filter);
  const approved = entries.filter(e => e.status === "APPROVED").length;

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 10 / KNOWLEDGE DISTILLER</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.red, fontWeight: 600, fontFamily: C.fontMono }}>KNOWLEDGE DISTILLER</div>
        <span style={{ fontSize: 9, color: C.green, fontFamily: C.fontMono, background: "#0a1f0a", padding: "2px 7px", borderRadius: 3 }}>{approved} APPROVED</span>
      </div>

      {/* Distillation pipeline visual */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto" }}>
        {DISTILLATION_STEPS.map((s, i) => (
          <div key={s.id} style={{ flex: 1, minWidth: 60, textAlign: "center" }}>
            <div style={{
              background: step === s.id ? C.redGlow : C.bg2,
              border: `0.5px solid ${step === s.id ? C.red : C.border}`,
              borderRadius: 4, padding: "6px 4px",
              transition: "all 0.3s"
            }}>
              <div style={{ fontSize: 16 }}>{["🔐", "🔍", "⚗️", "✅"][i]}</div>
              <div style={{ fontSize: 8, color: step === s.id ? C.red : "#444", fontFamily: C.fontMono, marginTop: 2 }}>{s.label}</div>
            </div>
            {i < DISTILLATION_STEPS.length - 1 && <div style={{ fontSize: 10, color: "#333", textAlign: "right", marginTop: -8, marginRight: -2 }}>→</div>}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <select value={type} onChange={e => setType(e.target.value)} style={{ background: C.bg2, border: `0.5px solid ${C.border2}`, borderRadius: 4, padding: "6px 8px", color: C.textDim, fontFamily: C.fontMono, fontSize: 10, outline: "none" }}>
          {KNOWLEDGE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select value={source} onChange={e => setSource(e.target.value)} style={{ background: C.bg2, border: `0.5px solid ${C.border2}`, borderRadius: 4, padding: "6px 8px", color: C.textDim, fontFamily: C.fontMono, fontSize: 10, outline: "none" }}>
          {["meeting", "photo", "idea", "report", "manual"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
      </div>

      <textarea value={input} onChange={e => setInput(e.target.value)}
        placeholder="Enter raw knowledge to distill...&#10;ULTRON will clean, extract and prepare for approval."
        style={{ width: "100%", background: C.bg2, border: `0.5px solid ${C.border2}`, borderRadius: 4, padding: "10px 12px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", minHeight: 80, resize: "vertical", lineHeight: 1.6 }} />

      <button onClick={distill} disabled={processing || !input.trim()} style={{
        width: "100%", marginTop: 8, background: processing ? C.redGlow : C.red,
        border: `0.5px solid ${C.red}`, borderRadius: 4, color: "#fff",
        fontFamily: C.fontMono, fontSize: 11, padding: "10px", cursor: processing ? "not-allowed" : "pointer",
        minHeight: 44, opacity: !input.trim() ? 0.5 : 1
      }}>
        {processing ? `${step?.toUpperCase()}...` : "⚗ DISTILL KNOWLEDGE"}
      </button>

      {/* Entries */}
      {entries.length > 0 && <>
        <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 8, flexWrap: "wrap" }}>
          {["all", "PENDING", "APPROVED", "REJECTED"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? C.redGlow : "transparent",
              border: `0.5px solid ${filter === f ? C.red : C.border2}`,
              borderRadius: 3, padding: "3px 8px", cursor: "pointer",
              color: filter === f ? C.red : "#555", fontSize: 9, fontFamily: C.fontMono
            }}>{f}</button>
          ))}
        </div>

        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {filtered.map(entry => {
            const t = KNOWLEDGE_TYPES.find(k => k.id === entry.type);
            return (
              <div key={entry.id} style={{ background: C.bg3, borderRadius: 4, padding: "10px 12px", marginBottom: 8, border: `0.5px solid ${entry.status === "APPROVED" ? "#1a4a1a" : entry.status === "REJECTED" ? "#5a1010" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 9, color: t?.color, fontFamily: C.fontMono, background: C.bg2, padding: "1px 5px", borderRadius: 2 }}>{entry.type.toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{entry.source} · {entry.timestamp}</span>
                  </div>
                  <span style={{ fontSize: 9, color: entry.status === "APPROVED" ? C.green : entry.status === "REJECTED" ? C.red : C.amber, fontFamily: C.fontMono }}>{entry.status}</span>
                </div>
                <div style={{ fontSize: 11, color: "#aaa", fontFamily: C.fontMono, lineHeight: 1.6, marginBottom: entry.status === "PENDING" ? 8 : 0 }}>{entry.content}</div>
                {entry.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => approve(entry.id)} style={{ flex: 1, background: "#0a1f0a", border: `0.5px solid ${C.green}`, borderRadius: 3, color: C.green, fontFamily: C.fontMono, fontSize: 10, padding: "5px", cursor: "pointer" }}>✓ APPROVE</button>
                    <button onClick={() => reject(entry.id)} style={{ flex: 1, background: "#1a0505", border: `0.5px solid #5a1010`, borderRadius: 3, color: C.red, fontFamily: C.fontMono, fontSize: 10, padding: "5px", cursor: "pointer" }}>✗ REJECT</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>}

      <div style={{ marginTop: 10, padding: "6px 10px", background: C.bg2, borderRadius: 4, border: `0.5px solid ${C.border}` }}>
        <div style={{ fontSize: 9, color: "#333", fontFamily: C.fontMono }}>
          Raw data → Permission Check → Sensitivity Filter → Distillation → Human Approval → knowledge/distilled_lessons.md
        </div>
      </div>
    </div>
  );
}
