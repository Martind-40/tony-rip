import React, { useState } from "react";

const C = {
  bg1: "#0d0d0d", bg2: "#111", border: "#1e1e1e", border2: "#2a2a2a",
  red: "#c0392b", redGlow: "rgba(192,57,43,0.15)",
  text: "#e8e8e8", textDim: "#888", textFaint: "#444",
  green: "#27ae60", amber: "#e67e22",
  fontMono: "'Share Tech Mono', monospace", fontUI: "'Rajdhani', monospace"
};

const FOLDERS = [
  { id: "meetings", icon: "🎙", label: "MEETINGS", desc: "Audio · Transcripts · Notes", read: true, write: false },
  { id: "photos", icon: "📷", label: "PHOTOS", desc: "Field captures · Images", read: true, write: false },
  { id: "ideas", icon: "💡", label: "IDEAS", desc: "Quick notes · Concepts", read: true, write: true },
  { id: "reports", icon: "📄", label: "REPORTS", desc: "Generated outputs", read: true, write: true },
  { id: "archive", icon: "📦", label: "ARCHIVE", desc: "Processed items", read: true, write: false }
];

export default function WorkspacePanel({ onNavigate }) {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 08 / AETHERNOVA WORKSPACE</div>
      <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 12, fontFamily: C.fontMono, letterSpacing: "0.06em" }}>WORKSPACE</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 12 }}>
        {FOLDERS.map(f => (
          <button key={f.id} onClick={() => { setSelected(f.id); onNavigate && onNavigate(f.id); }} style={{
            background: selected === f.id ? C.redGlow : C.bg2,
            border: `0.5px solid ${selected === f.id ? C.red : C.border2}`,
            borderRadius: 5, padding: "10px 10px", cursor: "pointer", textAlign: "left"
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{f.icon}</div>
            <div style={{ fontSize: 10, color: selected === f.id ? C.red : C.textDim, fontFamily: C.fontMono, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
            <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, lineHeight: 1.4 }}>{f.desc}</div>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {f.read && <span style={{ fontSize: 8, color: C.green, fontFamily: C.fontMono, background: "#0a1f0a", padding: "1px 4px", borderRadius: 2 }}>READ</span>}
              {f.write && <span style={{ fontSize: 8, color: C.amber, fontFamily: C.fontMono, background: "#1f1500", padding: "1px 4px", borderRadius: 2 }}>WRITE</span>}
            </div>
          </button>
        ))}
      </div>

      <div style={{ background: C.bg2, borderRadius: 4, padding: "8px 10px", border: `0.5px solid ${C.border}` }}>
        <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 4 }}>SECURITY POLICY</div>
        {[
          ["Read outside workspace", "BLOCKED"],
          ["Write outside reports/", "BLOCKED"],
          ["Delete files", "BLOCKED"],
          ["Access .env / credentials", "BLOCKED"],
          ["Send raw data to ecosystem", "BLOCKED"],
          ["Distillation before export", "REQUIRED"],
          ["Human approval", "REQUIRED"]
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `0.5px solid ${C.border}` }}>
            <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.fontMono }}>{label}</span>
            <span style={{ fontSize: 9, color: val === "BLOCKED" ? C.red : C.green, fontFamily: C.fontMono }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
