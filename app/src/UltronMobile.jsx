import React, { useState, useEffect, useRef, useCallback } from "react";
import WorkspacePanel from "./WorkspacePanel";
import MeetingPanel from "./MeetingPanel";
import KnowledgePanel from "./KnowledgePanel";
import AgentsPanel from "./AgentsPanel";
import EcosystemPanel from "./EcosystemPanel";
import VoiceCompanion from "./VoiceCompanion";
import PhotoPanel from "./PhotoPanel";
import CostsDashboard from "./CostsDashboard";

const BACKEND_URL = "http://localhost:3001";
const TOKEN = "ULTRON_LOCAL_OPERATOR_TOKEN";

const COMMAND_ALLOWLIST = [
  "pwd", "git status", "git log --oneline -5",
  "git diff --stat", "npm run build", "find . -maxdepth 2 -type f"
];
const MEMORY_FILES = [
  "operator_command_log.md",
  "v1_1_real_operator_testing_snapshot.json",
  "runtime_config.json"
];

// Action tag patterns — from ethanplusai/jarvis pattern
const ACTION_PATTERNS = [
  { tag: "[ACTION:MEETING]", trigger: /\b(reunión|meeting|minuta|transcri)/i, tab: "meetings" },
  { tag: "[ACTION:DISTILL]", trigger: /\b(destila|distill|conocimiento|knowledge)\b/i, tab: "knowledge" },
  { tag: "[ACTION:AGENTS]", trigger: /\b(agente|agent|tarea|task|ejecuta)\b/i, tab: "agents" },
  { tag: "[ACTION:WORKSPACE]", trigger: /\b(workspace|carpeta|folder|archivo|file)\b/i, tab: "workspace" },
  { tag: "[ACTION:ECOSYSTEM]", trigger: /\b(ecosistema|ecosystem|ruta|route|coco|aether)\b/i, tab: "ecosystem" },
  { tag: "[ACTION:COSTS]", trigger: /\b(costo|cost|consumo|budget|presupuesto)\b/i, tab: "costs" },
  { tag: "[ACTION:PHOTO]", trigger: /\b(foto|photo|imagen|image|captura|capture)\b/i, tab: "photo" }
];

function detectAction(message) {
  for (const p of ACTION_PATTERNS) {
    if (p.trigger.test(message)) return p;
  }
  return null;
}

function authFetch(path, options = {}) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "x-ultron-token": TOKEN, ...(options.headers || {}) }
  });
}

// ── Design System ─────────────────────────────────────────
const C = {
  bg: "#050505", bg1: "#0a0a0a", bg2: "#0f0f0f", bg3: "#070707",
  red: "#c0392b", redBright: "#e74c3c", redDim: "#7a1a13",
  redGlow: "rgba(192,57,43,0.12)", redGlowBright: "rgba(231,76,60,0.25)",
  border: "#1a1a1a", border2: "#242424",
  text: "#e8e8e8", textDim: "#777", textFaint: "#333",
  green: "#27ae60", amber: "#e67e22",
  fontMono: "'Share Tech Mono', 'Courier New', monospace",
  fontUI: "'Rajdhani', 'Share Tech Mono', monospace"
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body { background: ${C.bg}; color: ${C.text}; font-family: ${C.fontUI}; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 2px; height: 2px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.redDim}; border-radius: 2px; }
  input, textarea, button, select { font-family: inherit; }
  input::placeholder, textarea::placeholder { color: ${C.textFaint}; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes pulseRed { 0%,100%{box-shadow:0 0 4px rgba(192,57,43,0.4)} 50%{box-shadow:0 0 12px rgba(192,57,43,0.8)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes spinReverse { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes bootFlash { 0%{opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0} }
  @keyframes waveform { 0%,100%{height:4px} 50%{height:20px} }
  @keyframes glitch { 0%{transform:translate(0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(2px,-1px)} 60%{transform:translate(-1px,2px)} 80%{transform:translate(1px,-2px)} 100%{transform:translate(0)} }
  @keyframes ringPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.4);opacity:0} }

  .msg-in { animation: slideUp 0.2s ease; }
  .hud-boot { animation: bootFlash 0.3s ease; }
  .ring-pulse { animation: ringPulse 2s ease-out infinite; }
  .scanline { position:fixed;top:0;left:0;right:0;height:1px;background:linear-gradient(transparent,rgba(192,57,43,0.15),transparent);animation:scanline 6s linear infinite;pointer-events:none;z-index:9999;opacity:0.4; }
  .glitch { animation: glitch 0.3s ease; }
`;

// ── Boot Screen ───────────────────────────────────────────
function BootScreen({ onComplete }) {
  const [line, setLine] = useState(0);
  const lines = [
    "INITIALIZING ULTRON CORE...",
    "LOADING KNOWLEDGE OPERATOR...",
    "CONNECTING SUPERVISED AGENTS...",
    "ACTIVATING GUARDRAILS...",
    "AETHERNOVA WORKSPACE READY",
    "SYSTEM ONLINE"
  ];

  useEffect(() => {
    if (line < lines.length) {
      const t = setTimeout(() => setLine(l => l + 1), 280);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
  }, [line]);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      {/* Rings */}
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40 }}>
        <div style={{ position: "absolute", inset: 0, border: `1px solid ${C.red}`, borderRadius: "50%", animation: "spin 4s linear infinite", opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 10, border: `0.5px solid ${C.redDim}`, borderRadius: "50%", animation: "spinReverse 3s linear infinite", opacity: 0.4 }} />
        <div style={{ position: "absolute", inset: 22, border: `1px solid ${C.red}`, borderRadius: "50%", animation: "spin 2s linear infinite", opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: C.fontMono, fontSize: 11, color: C.red, letterSpacing: 3 }}>ULTRON</span>
        </div>
      </div>

      {/* Boot lines */}
      <div style={{ width: "min(340px, 90vw)" }}>
        {lines.slice(0, line).map((l, i) => (
          <div key={i} className="msg-in" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: C.red, fontFamily: C.fontMono, fontSize: 10 }}>▶</span>
            <span style={{ fontFamily: C.fontMono, fontSize: 10, color: i === line - 1 ? C.red : C.textDim, letterSpacing: 1 }}>{l}</span>
            {i === line - 1 && <span style={{ fontFamily: C.fontMono, fontSize: 10, color: C.red, animation: "blink 0.6s infinite" }}>▋</span>}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: "min(340px, 90vw)", height: 1, background: C.border2, marginTop: 20, borderRadius: 1, overflow: "hidden" }}>
        <div style={{ height: "100%", background: C.red, width: `${(line / lines.length) * 100}%`, transition: "width 0.28s ease", boxShadow: `0 0 8px ${C.red}` }} />
      </div>
    </div>
  );
}

// ── HUD Rings (idle animation) ────────────────────────────
function HUDRings({ active, listening }) {
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      {/* Pulse rings when listening */}
      {listening && <>
        <div className="ring-pulse" style={{ position: "absolute", inset: -8, border: `1px solid ${C.red}`, borderRadius: "50%", opacity: 0.6 }} />
        <div className="ring-pulse" style={{ position: "absolute", inset: -8, border: `1px solid ${C.red}`, borderRadius: "50%", animationDelay: "0.5s" }} />
      </>}
      <div style={{ position: "absolute", inset: 0, border: `0.5px solid ${C.red}`, borderRadius: "50%", animation: "spin 8s linear infinite", opacity: active ? 0.7 : 0.3 }} />
      <div style={{ position: "absolute", inset: 6, border: `0.5px solid ${C.redDim}`, borderRadius: "50%", animation: "spinReverse 6s linear infinite", opacity: active ? 0.5 : 0.2 }} />
      <div style={{ position: "absolute", inset: 12, border: `0.5px solid ${C.red}`, borderRadius: "50%", animation: "spin 4s linear infinite", opacity: active ? 0.8 : 0.3 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, boxShadow: `0 0 ${active ? 8 : 3}px ${C.red}`, animation: active ? "pulse 1.5s infinite" : "none" }} />
      </div>
    </div>
  );
}

// ── Waveform (voice visualization) ───────────────────────
function Waveform({ active }) {
  const bars = 20;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 28, padding: "0 4px" }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 2, borderRadius: 1, background: C.red,
          height: active ? "100%" : 3,
          opacity: active ? 0.6 + Math.sin(i * 0.8) * 0.4 : 0.2,
          animation: active ? `waveform ${0.4 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite alternate` : "none",
          transition: "height 0.3s"
        }} />
      ))}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────
function Badge({ children, color = "red", small }) {
  const p = {
    red: { bg: "#0f0202", text: C.red, border: "#3a0808" },
    green: { bg: "#020f04", text: C.green, border: "#0a3a15" },
    amber: { bg: "#0f0802", text: C.amber, border: "#3a2008" },
    gray: { bg: "#0f0f0f", text: C.textDim, border: "#1e1e1e" }
  }[color] || { bg: "#0f0f0f", text: C.textDim, border: "#1e1e1e" };
  return <span style={{ background: p.bg, color: p.text, border: `0.5px solid ${p.border}`, borderRadius: 2, padding: small ? "1px 5px" : "2px 8px", fontSize: small ? 8 : 9, fontFamily: C.fontMono, letterSpacing: "0.1em", fontWeight: 500, whiteSpace: "nowrap" }}>{children}</span>;
}

// ── Card ──────────────────────────────────────────────────
function Card({ title, eyebrow, children, style = {}, action, glow }) {
  return (
    <div style={{
      background: C.bg1, borderRadius: 4,
      border: `0.5px solid ${glow ? C.redDim : C.border}`,
      boxShadow: glow ? `0 0 20px ${C.redGlow}, inset 0 0 20px rgba(192,57,43,0.03)` : "none",
      padding: "12px 14px", marginBottom: 8, ...style
    }}>
      {(eyebrow || action) && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: title ? 3 : 10 }}>
        {eyebrow && <span style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.16em", fontFamily: C.fontMono, textTransform: "uppercase" }}>{eyebrow}</span>}
        {action}
      </div>}
      {title && <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 10, fontFamily: C.fontMono, letterSpacing: "0.08em", textShadow: `0 0 8px ${C.redGlow}` }}>{title}</div>}
      {children}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────
function Btn({ children, onClick, variant = "ghost", disabled, style = {}, size = "md" }) {
  const v = {
    primary: { background: C.red, border: `0.5px solid ${C.red}`, color: "#fff", boxShadow: `0 0 12px ${C.redGlow}` },
    ghost: { background: "transparent", border: `0.5px solid ${C.border2}`, color: C.textDim },
    danger: { background: "#0f0202", border: `0.5px solid #3a0808`, color: C.red },
    active: { background: C.redGlow, border: `0.5px solid ${C.red}`, color: C.red }
  }[variant];
  const s = { sm: { padding: "4px 10px", fontSize: 9, minHeight: 30 }, md: { padding: "8px 16px", fontSize: 10, minHeight: 44 } }[size];
  return <button onClick={onClick} disabled={disabled} style={{ ...v, ...s, borderRadius: 3, cursor: disabled ? "not-allowed" : "pointer", fontFamily: C.fontMono, letterSpacing: "0.06em", opacity: disabled ? 0.35 : 1, transition: "all 0.15s", ...style }}>{children}</button>;
}

function Row({ label, value, valueColor }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `0.5px solid ${C.border}` }}>
    <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.fontMono }}>{label}</span>
    <span style={{ fontSize: 10, color: valueColor || C.text, fontFamily: C.fontMono }}>{value}</span>
  </div>;
}

// ── Chat Panel — HUD style ────────────────────────────────
function ChatPanel({ backendOnline, activeModel, setActiveModel, onAction }) {
  const [messages, setMessages] = useState([
    { role: "system", text: "ULTRON v2.7 — AETHERNOVA FULL OPERATOR STACK ONLINE.", ts: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR(); rec.continuous = false; rec.interimResults = true; rec.lang = "es-MX";
    rec.onresult = e => setInput(Array.from(e.results).map(r => r[0].transcript).join(""));
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    // Special commands
    if (text === "/clear") { setMessages([{ role: "system", text: "Chat cleared.", ts: new Date().toLocaleTimeString() }]); setInput(""); return; }
    if (text.startsWith("/model ")) { const m = text.replace("/model ", "").trim(); setActiveModel(m); setMessages(p => [...p, { role: "system", text: `Provider: ${m.toUpperCase()}`, ts: new Date().toLocaleTimeString() }]); setInput(""); return; }

    // Detect action tags
    const action = detectAction(text);
    if (action) {
      setMessages(p => [...p, { role: "user", text, ts: new Date().toLocaleTimeString() }]);
      setMessages(p => [...p, { role: "action", text: `${action.tag} → Navigating to ${action.tab.toUpperCase()}`, tab: action.tab, ts: new Date().toLocaleTimeString() }]);
      setInput("");
      setTimeout(() => onAction && onAction(action.tab), 400);
      return;
    }

    setMessages(m => [...m, { role: "user", text, ts: new Date().toLocaleTimeString() }]);
    setInput(""); setLoading(true);
    try {
      if (backendOnline) {
        const res = await authFetch("/api/chat", { method: "POST", body: JSON.stringify({ message: text, model: activeModel !== "auto" ? activeModel : undefined }) });
        const data = await res.json();
        setMessages(m => [...m, { role: "ultron", text: data.message || "No response.", provider: data.provider, level: data.level, ts: new Date().toLocaleTimeString() }]);
      } else {
        setMessages(m => [...m, { role: "ultron", text: "Backend offline. Run: npm run backend", ts: new Date().toLocaleTimeString() }]);
      }
    } catch { setMessages(m => [...m, { role: "ultron", text: "Connection failed.", ts: new Date().toLocaleTimeString() }]); }
    setLoading(false);
  }

  function toggleVoice() {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { setInput(""); setListening(true); recRef.current.start(); }
  }

  const models = ["auto", "openai", "gemini", "claude", "ollama"];

  return (
    <Card eyebrow="01 / OPERATOR CHAT" glow={loading || listening}>
      {/* Model selector */}
      <div style={{ display: "flex", gap: 3, marginBottom: 8, flexWrap: "wrap" }}>
        {models.map(m => <button key={m} onClick={() => setActiveModel(m)} style={{
          background: activeModel === m ? C.redGlow : "transparent",
          border: `0.5px solid ${activeModel === m ? C.red : C.border}`,
          borderRadius: 2, padding: "2px 7px", cursor: "pointer",
          color: activeModel === m ? C.red : "#333",
          fontSize: 8, fontFamily: C.fontMono, letterSpacing: "0.08em"
        }}>{m.toUpperCase()}</button>)}
      </div>

      {/* Messages */}
      <div style={{ height: 200, overflowY: "auto", background: C.bg3, borderRadius: 3, padding: "8px 10px", marginBottom: 8, border: `0.5px solid ${C.border}` }}>
        {messages.map((m, i) => <div key={i} className="msg-in" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
            <span style={{ fontSize: 8, color: m.role === "user" ? C.red : m.role === "action" ? C.amber : m.role === "system" ? "#222" : "#333", fontFamily: C.fontMono, letterSpacing: "0.06em" }}>
              {m.role === "user" ? "▶ CHIEF" : m.role === "action" ? "⚡ ACTION" : m.role === "system" ? "SYS" : `◀ ULTRON${m.provider ? ` [${m.provider}${m.level !== undefined ? ` L${m.level}` : ""}]` : ""}`}
            </span>
            <span style={{ fontSize: 7, color: "#1e1e1e", fontFamily: C.fontMono }}>{m.ts}</span>
          </div>
          <div style={{ fontSize: 11, color: m.role === "user" ? C.text : m.role === "action" ? C.amber : m.role === "system" ? "#333" : "#999", lineHeight: 1.6 }}>
            {m.text}
            {m.tab && <button onClick={() => onAction(m.tab)} style={{ marginLeft: 8, fontSize: 8, color: C.amber, background: "transparent", border: `0.5px solid ${C.amber}`, borderRadius: 2, padding: "1px 5px", cursor: "pointer", fontFamily: C.fontMono }}>→ GO</button>}
          </div>
        </div>)}
        {loading && <div style={{ fontSize: 11, color: C.red, fontFamily: C.fontMono }}>◀ ULTRON&gt; <span style={{ animation: "blink 0.7s infinite" }}>▋</span></div>}
        <div ref={bottomRef} />
      </div>

      {/* Waveform when listening */}
      {listening && <div style={{ marginBottom: 6 }}><Waveform active={listening} /></div>}

      {/* Input */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={toggleVoice} style={{
          background: listening ? C.redGlow : "transparent",
          border: `0.5px solid ${listening ? C.red : C.border2}`,
          borderRadius: 3, color: listening ? C.red : C.textDim,
          fontFamily: C.fontMono, fontSize: 14, padding: "0 12px",
          cursor: "pointer", minHeight: 44,
          animation: listening ? "pulseRed 1s infinite" : "none"
        }}>🎙</button>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={listening ? "Listening..." : "/model · /clear · Ask ULTRON..."}
          style={{ flex: 1, background: C.bg2, border: `0.5px solid ${listening ? C.red : C.border2}`, borderRadius: 3, padding: "10px 12px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", minHeight: 44, transition: "border-color 0.2s" }} />
        <Btn onClick={send} variant="primary" style={{ minWidth: 48, fontSize: 14 }}>▶</Btn>
      </div>
      <div style={{ marginTop: 4, fontSize: 8, color: "#1e1e1e", fontFamily: C.fontMono }}>
        ACTION TAGS: meeting · distill · agents · workspace · ecosystem · costs · photo
      </div>
    </Card>
  );
}

// ── Command Panel ─────────────────────────────────────────
function CommandPanel({ backendOnline }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  async function dryRun(cmd) {
    setSelected(cmd); setResult(null); setLoading(true);
    try {
      if (backendOnline) { const res = await authFetch("/api/execute", { method: "POST", body: JSON.stringify({ command: cmd, approved: true }) }); setResult(await res.json()); }
      else setResult({ ok: true, execution: "DRY_RUN", message: "Backend offline." });
    } catch { setResult({ ok: false, reason: "Failed." }); }
    setLoading(false);
  }
  return <Card eyebrow="03 / COMMANDS">
    {COMMAND_ALLOWLIST.map(cmd => <button key={cmd} onClick={() => dryRun(cmd)} style={{
      display: "block", width: "100%", textAlign: "left",
      background: selected === cmd ? C.redGlow : "transparent",
      border: `0.5px solid ${selected === cmd ? C.red : C.border}`,
      borderRadius: 3, padding: "8px 10px", marginBottom: 4,
      color: selected === cmd ? C.red : "#2a2a2a",
      fontFamily: C.fontMono, fontSize: 10, cursor: "pointer", minHeight: 38,
      transition: "all 0.15s"
    }}>$ {cmd}</button>)}
    {loading && <div style={{ fontSize: 9, color: C.red, fontFamily: C.fontMono }}>Validating...</div>}
    {result && <div style={{ background: C.bg3, borderRadius: 3, padding: "7px 9px", border: `0.5px solid ${result.ok ? "#0a2a15" : "#2a0808"}` }}>
      <div style={{ fontSize: 8, color: result.ok ? C.green : C.red, fontFamily: C.fontMono, marginBottom: 2 }}>{result.ok ? "✓ DRY_RUN VALIDATED" : "✗ BLOCKED"}</div>
      <div style={{ fontSize: 10, color: "#666", fontFamily: C.fontMono }}>{result.message || result.reason}</div>
    </div>}
  </Card>;
}

// ── Task Queue ────────────────────────────────────────────
function TaskQueue() {
  const SF = { DRAFT: "PENDING_APPROVAL", PENDING_APPROVAL: "APPROVED", APPROVED: "DRY_RUN_EXECUTED", DRY_RUN_EXECUTED: "DRAFT", BLOCKED: "DRAFT" };
  const SC = { DRAFT: "gray", PENDING_APPROVAL: "amber", APPROVED: "green", DRY_RUN_EXECUTED: "green", BLOCKED: "red" };
  const [tasks, setTasks] = useState([
    { id: "T001", title: "Review git status", status: "DRAFT" },
    { id: "T002", title: "Process meeting notes", status: "PENDING_APPROVAL" },
    { id: "T003", title: "Distill knowledge", status: "APPROVED" }
  ]);
  const [input, setInput] = useState("");
  return <Card eyebrow="04 / TASKS" action={<Badge color="gray">{tasks.length}</Badge>}>
    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && input.trim() && (setTasks(p => [{ id: `T${String(Date.now()).slice(-4)}`, title: input.trim(), status: "DRAFT" }, ...p]), setInput(""))}
        placeholder="New task..."
        style={{ flex: 1, background: C.bg2, border: `0.5px solid ${C.border2}`, borderRadius: 3, padding: "8px 10px", color: C.text, fontFamily: C.fontMono, fontSize: 10, outline: "none", minHeight: 40 }} />
      <Btn onClick={() => input.trim() && (setTasks(p => [{ id: `T${String(Date.now()).slice(-4)}`, title: input.trim(), status: "DRAFT" }, ...p]), setInput(""))} variant="danger" style={{ minWidth: 40 }}>+</Btn>
    </div>
    <div style={{ maxHeight: 180, overflowY: "auto" }}>
      {tasks.map(t => <div key={t.id} className="msg-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg2, borderRadius: 3, padding: "7px 9px", marginBottom: 4, border: `0.5px solid ${C.border}`, gap: 6 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 7, color: "#222", fontFamily: C.fontMono }}>{t.id}</div>
          <div style={{ fontSize: 11, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Badge color={SC[t.status] || "gray"} small>{t.status.slice(0, 4)}</Badge>
          <button onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, status: SF[x.status] } : x))} style={{ background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: 2, color: "#333", cursor: "pointer", fontSize: 9, padding: "2px 5px", minHeight: 24, fontFamily: C.fontMono }}>▶</button>
          <button onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, status: "BLOCKED" } : x))} style={{ background: "transparent", border: `0.5px solid #2a0808`, borderRadius: 2, color: C.red, cursor: "pointer", fontSize: 9, padding: "2px 5px", minHeight: 24, fontFamily: C.fontMono }}>✗</button>
        </div>
      </div>)}
    </div>
  </Card>;
}

// ── Security Panel ────────────────────────────────────────
function SecurityPanel({ backendInfo }) {
  return <Card eyebrow="06 / GUARDRAILS">
    {[["External network", "OFF", "green"], ["Secrets", "OFF", "green"], [".env access", "OFF", "green"], ["Git push", "OFF", "green"], ["Shell real", "OFF", "green"], ["Human approval", "ON", "green"], ["Autonomous agents", "BLOCKED", "gray"], ["Claude", backendInfo?.claudeProxy || "WAITING", backendInfo?.claudeProxy === "READY_WITH_KEY" ? "green" : "gray"], ["OpenAI", backendInfo?.openaiProxy || "WAITING", backendInfo?.openaiProxy === "READY_WITH_KEY" ? "green" : "gray"], ["Gemini", backendInfo?.geminiProxy || "WAITING", backendInfo?.geminiProxy === "READY_WITH_KEY" ? "green" : "gray"]].map(([l, v, c]) => (
      <Row key={l} label={l} value={<Badge color={c} small>{v}</Badge>} />
    ))}
  </Card>;
}

// ── Memory Panel ──────────────────────────────────────────
function MemoryPanel({ backendOnline }) {
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(null);
  async function readFile(file) {
    setLoading(file);
    try { if (backendOnline) { const res = await authFetch(`/api/memory/${file}`); const d = await res.json(); setContents(p => ({ ...p, [file]: d.content || d.reason })); } else setContents(p => ({ ...p, [file]: "Backend offline." })); } catch { setContents(p => ({ ...p, [file]: "Error." })); }
    setLoading(null);
  }
  return <Card eyebrow="05 / MEMORY">
    <Row label="L0 Session" value="active" valueColor={C.green} />
    <Row label="L1 Operative" value="runtime/logs" valueColor={C.textDim} />
    <Row label="L2 Distilled" value="knowledge/ ACTIVE" valueColor={C.amber} />
    <Row label="L3 Ecosystem" value="BLOCKED_UNTIL_KEY" valueColor="#222" />
    <div style={{ marginTop: 8 }}>
      {MEMORY_FILES.map(file => <div key={file} style={{ marginBottom: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 9, color: "#333", fontFamily: C.fontMono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 6 }}>{file}</span>
          <Btn onClick={() => readFile(file)} size="sm" variant="ghost">{loading === file ? "..." : "READ"}</Btn>
        </div>
        {contents[file] && <pre style={{ background: C.bg3, borderRadius: 2, padding: "5px 8px", fontSize: 8, color: "#444", fontFamily: C.fontMono, overflowX: "auto", maxHeight: 60, border: `0.5px solid ${C.border}`, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{contents[file].slice(0, 250)}</pre>}
      </div>)}
    </div>
  </Card>;
}

// ── External Tools ────────────────────────────────────────
function ExternalToolsPanel() {
  const tools = [
    { name: "Fish Audio TTS", use: "Voice premium — alt ElevenLabs", status: "PLANNED", sprint: "v1.6+" },
    { name: "Groq (llama-3.1)", use: "Free ultra-fast AI — Nivel 2a", status: "PLANNED", sprint: "v1.8+" },
    { name: "LiteLLM", use: "Multi-provider router", status: "PLANNED", sprint: "v1.8+" },
    { name: "SQLite Memory", use: "Reemplaza JSON — mem persistente", status: "PLANNED", sprint: "v2.2+" },
    { name: "whisper.cpp", use: "Transcripción local audio", status: "PLANNED", sprint: "v2.0+" },
    { name: "mem0", use: "Memoria agentes persistente", status: "PLANNED", sprint: "v2.3+" },
    { name: "Ollama Qwen2.5", use: "LLM local privado", status: "READY", sprint: "v1.8" },
    { name: "Coworker AI", use: "Task management externo", status: "EVALUATING", sprint: "v2.7+" }
  ];
  const sc = { READY: "green", PLANNED: "gray", EVALUATING: "amber" };
  return <Card eyebrow="07 / TOOL REGISTRY">
    {tools.map(t => <div key={t.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: `0.5px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 10, color: C.text, fontFamily: C.fontMono }}>{t.name}</div>
        <div style={{ fontSize: 8, color: "#333", fontFamily: C.fontMono }}>{t.use}</div>
      </div>
      <Badge color={sc[t.status] || "gray"} small>{t.status}</Badge>
    </div>)}
  </Card>;
}

// ── Tabs ──────────────────────────────────────────────────
const TABS = [
  { id: "command", label: "CMD", icon: "⚡" },
  { id: "workspace", label: "WORK", icon: "📁" },
  { id: "meetings", label: "MTG", icon: "🎙" },
  { id: "knowledge", label: "KNW", icon: "⚗" },
  { id: "agents", label: "AGT", icon: "🤖" },
  { id: "ecosystem", label: "ECO", icon: "🔀" },
  { id: "voice", label: "VOICE", icon: "🥽" },
  { id: "photo", label: "PHOTO", icon: "📷" },
  { id: "costs", label: "COSTS", icon: "💰" },
  { id: "tools", label: "TOOLS", icon: "🔧" }
];

// ── Main App ──────────────────────────────────────────────
export default function UltronMobile() {
  const [booted, setBooted] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [backendInfo, setBackendInfo] = useState(null);
  const [activeModel, setActiveModel] = useState("auto");
  const [activeTab, setActiveTab] = useState("command");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [sessionSavedAt, setSessionSavedAt] = useState(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) { const d = await res.json(); setBackendOnline(true); setBackendInfo(d); }
      else setBackendOnline(false);
    } catch { setBackendOnline(false); }
    setChecking(false);
  }, []);

  const loadSession = useCallback(async () => {
    if (!backendOnline) return;
    try {
      const res = await authFetch("/api/session/load");
      const data = await res.json();
      if (data.ok && data.exists && data.state) {
        if (data.state.activeModel) setActiveModel(data.state.activeModel);
        if (data.state.activeTab) setActiveTab(data.state.activeTab);
        setSessionSavedAt(data.state._savedAt || null);
        setSessionLoaded(true);
      }
    } catch { }
  }, [backendOnline]);

  const saveSession = useCallback(async () => {
    if (!backendOnline) return;
    try {
      await authFetch("/api/session/save", { method: "POST", body: JSON.stringify({ state: { activeModel, activeTab, _client: "UltronMobile-HUD" } }) });
      setSessionSavedAt(new Date().toISOString());
    } catch { }
  }, [backendOnline, activeModel, activeTab]);

  useEffect(() => { checkHealth(); const i = setInterval(checkHealth, 12000); return () => clearInterval(i); }, [checkHealth]);
  useEffect(() => { if (backendOnline && !sessionLoaded) loadSession(); }, [backendOnline, sessionLoaded, loadSession]);
  useEffect(() => { if (!backendOnline) return; const i = setInterval(saveSession, 60000); return () => clearInterval(i); }, [backendOnline, saveSession]);

  if (!booted) return <BootScreen onComplete={() => setBooted(true)} />;

  const providerLabel = backendInfo?.aiRouter?.provider && backendInfo?.aiRouter?.provider !== "none"
    ? backendInfo.aiRouter.provider.toUpperCase() : null;

  return <>
    <style>{css}</style>
    <div className="scanline" />
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* ── HEADER ── */}
      <header style={{ background: C.bg1, borderBottom: `0.5px solid ${C.border}`, padding: "0 12px", position: "sticky", top: 0, zIndex: 100, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HUDRings active={backendOnline} listening={false} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.red, letterSpacing: "0.18em", fontFamily: C.fontUI, lineHeight: 1, textShadow: `0 0 12px ${C.redGlow}` }}>ULTRON</div>
            <div style={{ fontSize: 7, color: "#222", fontFamily: C.fontMono, letterSpacing: "0.1em" }}>KNOWLEDGE OPERATOR</div>
          </div>
          <Badge color="gray">v2.7</Badge>
          {providerLabel && <Badge color="red">{providerLabel}</Badge>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: backendOnline ? C.red : "#222", boxShadow: backendOnline ? `0 0 6px ${C.red}` : "none", animation: backendOnline ? "pulse 2s infinite" : "none" }} />
            <span style={{ fontSize: 7, color: checking ? "#222" : backendOnline ? C.red : "#222", fontFamily: C.fontMono, letterSpacing: "0.08em" }}>
              {checking ? "CHK" : backendOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <button onClick={saveSession} title="Save session" style={{ background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: 2, color: "#222", cursor: "pointer", fontSize: 9, padding: "2px 6px", fontFamily: C.fontMono }}>💾</button>
          <button onClick={checkHealth} style={{ background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: 2, color: "#222", cursor: "pointer", fontSize: 9, padding: "2px 6px", fontFamily: C.fontMono }}>↻</button>
        </div>
      </header>

      {/* Offline banner */}
      {!checking && !backendOnline && (
        <div style={{ background: "#0a0202", borderBottom: `0.5px solid #2a0808`, padding: "6px 12px", textAlign: "center" }}>
          <span style={{ fontSize: 9, color: C.red, fontFamily: C.fontMono }}>
            BACKEND OFFLINE — <code style={{ background: "#0f0202", padding: "1px 4px", borderRadius: 1 }}>cd app && npm run backend</code>
          </span>
        </div>
      )}

      {/* ── TABS ── */}
      <nav style={{ background: C.bg1, borderBottom: `0.5px solid ${C.border}`, padding: "0 8px", display: "flex", gap: 0, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {TABS.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
          background: "transparent",
          borderBottom: `1.5px solid ${activeTab === tab.id ? C.red : "transparent"}`,
          borderTop: "1.5px solid transparent",
          borderLeft: "none", borderRight: "none",
          padding: "8px 10px", cursor: "pointer",
          color: activeTab === tab.id ? C.red : "#2a2a2a",
          fontFamily: C.fontMono, fontSize: 8, letterSpacing: "0.1em",
          whiteSpace: "nowrap", transition: "all 0.15s",
          textShadow: activeTab === tab.id ? `0 0 8px ${C.redGlow}` : "none"
        }}>{tab.icon} {tab.label}</button>)}
      </nav>

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 10 }}>
        {activeTab === "command" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10, alignItems: "start" }}>
            <div>
              <ChatPanel backendOnline={backendOnline} activeModel={activeModel} setActiveModel={setActiveModel} onAction={tab => setActiveTab(tab)} />
              <CommandPanel backendOnline={backendOnline} />
            </div>
            <div>
              <TaskQueue />
              <MemoryPanel backendOnline={backendOnline} />
              <SecurityPanel backendInfo={backendInfo} />
            </div>
          </div>
        )}
        {activeTab === "workspace" && <WorkspacePanel backendOnline={backendOnline} />}
        {activeTab === "meetings" && <MeetingPanel backendOnline={backendOnline} />}
        {activeTab === "knowledge" && <KnowledgePanel backendOnline={backendOnline} />}
        {activeTab === "agents" && <AgentsPanel backendOnline={backendOnline} />}
        {activeTab === "ecosystem" && <EcosystemPanel backendOnline={backendOnline} />}
        {activeTab === "voice" && <VoiceCompanion onCommand={tab => setActiveTab(tab)} backendOnline={backendOnline} />}
        {activeTab === "photo" && <PhotoPanel backendOnline={backendOnline} />}
        {activeTab === "costs" && <CostsDashboard backendOnline={backendOnline} />}
        {activeTab === "tools" && <ExternalToolsPanel />}

        {/* Footer */}
        <div style={{ marginTop: 10, padding: "10px 12px", background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 8, color: C.redDim, fontFamily: C.fontMono, letterSpacing: "0.1em" }}>ULTRON v2.7 — AETHERNOVA FULL OPERATOR STACK</span>
          <span style={{ fontSize: 8, color: "#1e1e1e", fontFamily: C.fontMono }}>NEXT → FINAL: KEYS + CONSUMPTION</span>
        </div>
      </main>
    </div>
  </>;
}
