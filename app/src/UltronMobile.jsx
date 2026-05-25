import React, { useState, useEffect, useRef, useCallback } from "react";
import WorkspacePanel from "./WorkspacePanel";
import MeetingPanel from "./MeetingPanel";
import KnowledgePanel from "./KnowledgePanel";
import AgentsPanel from "./AgentsPanel";
import EcosystemPanel from "./EcosystemPanel";
import VoiceCompanion from "./VoiceCompanion";
import PhotoPanel from "./PhotoPanel";

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

function authFetch(path, options = {}) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "x-ultron-token": TOKEN, ...(options.headers || {}) }
  });
}

const C = {
  bg: "#080808", bg1: "#0d0d0d", bg2: "#111", bg3: "#0a0a0a",
  red: "#c0392b", redDim: "#8b1a13", redGlow: "rgba(192,57,43,0.15)",
  border: "#1e1e1e", border2: "#2a2a2a",
  text: "#e8e8e8", textDim: "#888", textFaint: "#444",
  green: "#27ae60", greenBg: "#0a1f0a",
  amber: "#e67e22", amberBg: "#1f1500",
  fontMono: "'Share Tech Mono', 'Courier New', monospace",
  fontUI: "'Rajdhani', 'Share Tech Mono', monospace"
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: ${C.fontUI}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: ${C.bg1}; }
  ::-webkit-scrollbar-thumb { background: ${C.redDim}; border-radius: 2px; }
  input, textarea, button, select { font-family: inherit; }
  input::placeholder, textarea::placeholder { color: ${C.textFaint}; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes slideIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  .msg-in { animation: slideIn 0.2s ease; }
  .scanline { position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(192,57,43,0.25),transparent);animation:scanline 5s linear infinite;pointer-events:none;z-index:9999;opacity:0.25; }
`;

function Dot({ on, pulse }) {
  return <span style={{ display:"inline-block",width:7,height:7,borderRadius:"50%",flexShrink:0,background:on?C.red:"#333",boxShadow:on?`0 0 6px ${C.red}`:"none",animation:pulse&&on?"pulse 1.5s infinite":"none" }} />;
}

function Badge({ children, color="red", small }) {
  const p = { red:{bg:"#1a0505",text:C.red,border:"#4a0a0a"}, green:{bg:C.greenBg,text:C.green,border:"#1a4a1a"}, amber:{bg:C.amberBg,text:C.amber,border:"#4a3000"}, gray:{bg:"#141414",text:C.textDim,border:"#2a2a2a"} }[color]||{bg:"#141414",text:C.textDim,border:"#2a2a2a"};
  return <span style={{ background:p.bg,color:p.text,border:`0.5px solid ${p.border}`,borderRadius:3,padding:small?"1px 5px":"2px 7px",fontSize:small?9:10,fontFamily:C.fontMono,letterSpacing:"0.08em",fontWeight:500,whiteSpace:"nowrap" }}>{children}</span>;
}

function Card({ title, eyebrow, children, style={}, action }) {
  return <div style={{ background:C.bg1,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"14px 16px",marginBottom:10,...style }}>
    {(eyebrow||action)&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:title?4:10 }}>
      {eyebrow&&<span style={{ fontSize:9,color:"#444",letterSpacing:"0.14em",fontFamily:C.fontMono }}>{eyebrow}</span>}
      {action}
    </div>}
    {title&&<div style={{ fontSize:12,color:C.red,fontWeight:600,marginBottom:12,fontFamily:C.fontMono,letterSpacing:"0.06em" }}>{title}</div>}
    {children}
  </div>;
}

function Btn({ children, onClick, variant="ghost", disabled, style={}, size="md" }) {
  const v = { primary:{background:C.red,border:`0.5px solid ${C.red}`,color:"#fff"}, ghost:{background:"transparent",border:`0.5px solid ${C.border2}`,color:C.textDim}, danger:{background:"#1a0505",border:`0.5px solid #5a1010`,color:C.red}, active:{background:C.redGlow,border:`0.5px solid ${C.red}`,color:C.red} }[variant];
  const s = { sm:{padding:"5px 10px",fontSize:10,minHeight:32}, md:{padding:"9px 16px",fontSize:11,minHeight:44} }[size];
  return <button onClick={onClick} disabled={disabled} style={{ ...v,...s,borderRadius:4,cursor:disabled?"not-allowed":"pointer",fontFamily:C.fontMono,opacity:disabled?0.4:1,...style }}>{children}</button>;
}

function Row({ label, value, valueColor }) {
  return <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`0.5px solid ${C.border}` }}>
    <span style={{ fontSize:11,color:C.textDim,fontFamily:C.fontMono }}>{label}</span>
    <span style={{ fontSize:11,color:valueColor||C.text,fontFamily:C.fontMono }}>{value}</span>
  </div>;
}

// ── External Tools Panel ───────────────────────────────────
function ExternalToolsPanel() {
  const tools = [
    { name: "LiteLLM", use: "Multi-provider AI router", sprint: "v1.8", status: "PLANNED", url: "github.com/BerriAI/litellm" },
    { name: "mem0", use: "Persistent agent memory", sprint: "v2.2+", status: "PLANNED", url: "github.com/mem0ai/mem0" },
    { name: "whisper.cpp", use: "Local audio transcription", sprint: "v2.0", status: "PLANNED", url: "github.com/ggml-org/whisper.cpp" },
    { name: "kokoro-js", use: "Free browser TTS", sprint: "v1.6", status: "READY", url: "github.com/hexgrad/kokoro" },
    { name: "Hermes (Nous)", use: "Local agent model", sprint: "v2.3+", status: "PLANNED", url: "huggingface.co/NousResearch" },
    { name: "Coworker AI", use: "Task management AI", sprint: "v2.7", status: "EVALUATING", url: "coworkerai.io" },
    { name: "Ollama", use: "Local LLM runner", sprint: "v1.8", status: "READY", url: "ollama.com" },
    { name: "Piper TTS", use: "Offline robotic TTS", sprint: "v1.6+", status: "PLANNED", url: "github.com/rhasspy/piper" }
  ];
  const statusColor = { READY: C.green, PLANNED: C.textDim, EVALUATING: C.amber, BLOCKED: C.red };

  return <Card eyebrow="MODULE 14 / EXTERNAL TOOLS" title="TOOL REGISTRY">
    {tools.map(t => <div key={t.name} style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 0",borderBottom:`0.5px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize:11,color:C.text,fontFamily:C.fontMono }}>{t.name}</div>
        <div style={{ fontSize:9,color:"#444",fontFamily:C.fontMono }}>{t.use} · {t.sprint}</div>
      </div>
      <span style={{ fontSize:9,color:statusColor[t.status]||C.textDim,fontFamily:C.fontMono,background:C.bg2,padding:"2px 6px",borderRadius:2,flexShrink:0,marginLeft:8 }}>{t.status}</span>
    </div>)}
    <div style={{ marginTop:10,fontSize:9,color:"#333",fontFamily:C.fontMono }}>No tools integrated yet. Architecture prepared for v2.7+</div>
  </Card>;
}

// ── Navigation tabs ────────────────────────────────────────
const TABS = [
  { id: "command", label: "CMD", icon: "⚡" },
  { id: "workspace", label: "WORK", icon: "📁" },
  { id: "meetings", label: "MTG", icon: "🎙" },
  { id: "knowledge", label: "KNW", icon: "⚗" },
  { id: "agents", label: "AGT", icon: "🤖" },
  { id: "ecosystem", label: "ECO", icon: "🔀" },
  { id: "voice", label: "VOICE", icon: "🥽" },
  { id: "tools", label: "TOOLS", icon: "🔧" },
  { id: "photo", label: "PHOTO", icon: "📷" }
];

// ── Chat Panel ─────────────────────────────────────────────
function ChatPanel({ backendOnline, activeModel, setActiveModel }) {
  const [messages, setMessages] = useState([{ role:"system", text:"ULTRON v2.7 — Full operator stack active. Bloque 3 complete.", ts:new Date().toLocaleTimeString() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (text === "/clear") { setMessages([{ role:"system", text:"Cleared.", ts:new Date().toLocaleTimeString() }]); setInput(""); return; }
    if (text.startsWith("/model ")) { const m = text.replace("/model ","").trim(); setActiveModel(m); setMessages(p=>[...p,{ role:"system", text:`Model: ${m.toUpperCase()}`, ts:new Date().toLocaleTimeString() }]); setInput(""); return; }
    setMessages(m=>[...m,{ role:"user", text, ts:new Date().toLocaleTimeString() }]);
    setInput(""); setLoading(true);
    try {
      if (backendOnline) {
        const res = await authFetch("/api/chat",{ method:"POST", body:JSON.stringify({ message:text, model:activeModel!=="auto"?activeModel:undefined }) });
        const data = await res.json();
        setMessages(m=>[...m,{ role:"ultron", text:data.message||"No response.", provider:data.provider, ts:new Date().toLocaleTimeString() }]);
      } else setMessages(m=>[...m,{ role:"ultron", text:"Backend offline.", ts:new Date().toLocaleTimeString() }]);
    } catch { setMessages(m=>[...m,{ role:"ultron", text:"Connection failed.", ts:new Date().toLocaleTimeString() }]); }
    setLoading(false);
  }

  return <Card eyebrow="MODULE 01 / CHAT" title="OPERATOR CHAT">
    <div style={{ display:"flex",gap:4,marginBottom:10,flexWrap:"wrap" }}>
      {["auto","openai","gemini","claude","ollama"].map(m=><button key={m} onClick={()=>setActiveModel(m)} style={{ background:activeModel===m?C.redGlow:"transparent",border:`0.5px solid ${activeModel===m?C.red:C.border2}`,borderRadius:3,padding:"3px 8px",cursor:"pointer",color:activeModel===m?C.red:"#555",fontSize:9,fontFamily:C.fontMono }}>{m.toUpperCase()}</button>)}
    </div>
    <div style={{ height:200,overflowY:"auto",background:"#050505",borderRadius:4,padding:"10px 12px",marginBottom:10,border:`0.5px solid ${C.border}` }}>
      {messages.map((m,i)=><div key={i} className="msg-in" style={{ marginBottom:10 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:2 }}>
          <span style={{ fontSize:9,color:m.role==="user"?C.red:m.role==="system"?"#444":"#555",fontFamily:C.fontMono }}>{m.role==="user"?"CHIEF":m.role==="system"?"SYS":`ULTRON${m.provider?` [${m.provider}]`:""}`}</span>
          <span style={{ fontSize:8,color:"#333",fontFamily:C.fontMono }}>{m.ts}</span>
        </div>
        <div style={{ fontSize:12,color:m.role==="user"?C.text:m.role==="system"?"#555":"#aaa",lineHeight:1.6 }}>{m.text}</div>
      </div>)}
      {loading&&<div style={{ fontSize:12,color:C.red,fontFamily:C.fontMono }}>ULTRON&gt; <span style={{ animation:"blink 0.8s infinite" }}>▋</span></div>}
      <div ref={bottomRef} />
    </div>
    <div style={{ display:"flex",gap:8 }}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="/model openai · /clear · Ask ULTRON..." style={{ flex:1,background:C.bg2,border:`0.5px solid ${C.border2}`,borderRadius:4,padding:"10px 12px",color:C.text,fontFamily:C.fontMono,fontSize:11,outline:"none",minHeight:44 }} />
      <Btn onClick={send} variant="primary" style={{ minWidth:56 }}>▶</Btn>
    </div>
  </Card>;
}

function VoicePanel() {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef(null);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR(); rec.continuous=false; rec.interimResults=true; rec.lang="es-MX";
    rec.onresult=e=>setTranscript(Array.from(e.results).map(r=>r[0].transcript).join(""));
    rec.onend=()=>setStatus("idle"); rec.onerror=()=>setStatus("error");
    recRef.current=rec;
  }, []);
  return <Card eyebrow="MODULE 02 / VOICE" title="VOICE INPUT">
    {!supported?<div style={{ fontSize:11,color:"#555",fontFamily:C.fontMono }}>Web Speech API not supported.</div>:<>
      <div style={{ display:"flex",gap:8,marginBottom:10 }}>
        <Btn onClick={()=>{ setTranscript(""); setStatus("listening"); recRef.current?.start(); }} disabled={status==="listening"} variant={status==="listening"?"active":"primary"} style={{ flex:1 }}>{status==="listening"?"● LISTENING...":"▶ START VOICE"}</Btn>
        <Btn onClick={()=>{ recRef.current?.stop(); setStatus("idle"); }} variant="ghost" style={{ minWidth:60 }}>■ STOP</Btn>
      </div>
      <div style={{ background:"#050505",borderRadius:4,padding:"10px 12px",minHeight:44,fontSize:12,color:transcript?C.text:"#333",fontFamily:C.fontMono,border:`0.5px solid ${C.border}`,lineHeight:1.6 }}>{transcript||"Transcript appears here..."}</div>
      <div style={{ marginTop:6,fontSize:9,color:"#333",fontFamily:C.fontMono }}>WEB SPEECH API (es-MX) · ELEVENLABS: BLOCKED_UNTIL_KEY</div>
    </>}
  </Card>;
}

function CommandPanel({ backendOnline }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  async function dryRun(cmd) {
    setSelected(cmd); setResult(null); setLoading(true);
    try {
      if (backendOnline) { const res=await authFetch("/api/execute",{method:"POST",body:JSON.stringify({command:cmd,approved:true})}); setResult(await res.json()); }
      else setResult({ ok:true,execution:"DRY_RUN",message:"Backend offline." });
    } catch { setResult({ ok:false,reason:"Failed." }); }
    setLoading(false);
  }
  return <Card eyebrow="MODULE 03 / COMMANDS" title="COMMAND CONSOLE">
    {COMMAND_ALLOWLIST.map(cmd=><button key={cmd} onClick={()=>dryRun(cmd)} style={{ display:"block",width:"100%",textAlign:"left",background:selected===cmd?C.redGlow:C.bg2,border:`0.5px solid ${selected===cmd?C.red:C.border}`,borderRadius:4,padding:"9px 12px",marginBottom:5,color:selected===cmd?C.red:"#666",fontFamily:C.fontMono,fontSize:11,cursor:"pointer",minHeight:40 }}>$ {cmd}</button>)}
    {loading&&<div style={{ fontSize:10,color:C.red,fontFamily:C.fontMono }}>Validating...</div>}
    {result&&<div style={{ background:"#050505",borderRadius:4,padding:"8px 10px",border:`0.5px solid ${result.ok?"#1a4a1a":"#5a1010"}` }}>
      <div style={{ fontSize:9,color:result.ok?C.green:C.red,fontFamily:C.fontMono,marginBottom:3 }}>{result.ok?"✓ DRY_RUN":"✗ BLOCKED"}</div>
      <div style={{ fontSize:11,color:"#777",fontFamily:C.fontMono }}>{result.message||result.reason}</div>
    </div>}
  </Card>;
}

function TaskQueue() {
  const SF={DRAFT:"PENDING_APPROVAL",PENDING_APPROVAL:"APPROVED",APPROVED:"DRY_RUN_EXECUTED",DRY_RUN_EXECUTED:"DRAFT",BLOCKED:"DRAFT"};
  const SC={DRAFT:"gray",PENDING_APPROVAL:"amber",APPROVED:"green",DRY_RUN_EXECUTED:"green",BLOCKED:"red"};
  const [tasks,setTasks]=useState([{id:"T001",title:"Review git status",status:"DRAFT"},{id:"T002",title:"Process meeting notes",status:"PENDING_APPROVAL"},{id:"T003",title:"Run knowledge distiller",status:"APPROVED"}]);
  const [input,setInput]=useState("");
  return <Card eyebrow="MODULE 04 / TASKS" title="TASK QUEUE" action={<Badge color="gray">{tasks.length}</Badge>}>
    <div style={{ display:"flex",gap:6,marginBottom:10 }}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&input.trim()&&(setTasks(p=>[{id:`T${String(Date.now()).slice(-4)}`,title:input.trim(),status:"DRAFT"},...p]),setInput(""))} placeholder="New task..." style={{ flex:1,background:C.bg2,border:`0.5px solid ${C.border2}`,borderRadius:4,padding:"9px 12px",color:C.text,fontFamily:C.fontMono,fontSize:11,outline:"none",minHeight:44 }} />
      <Btn onClick={()=>input.trim()&&(setTasks(p=>[{id:`T${String(Date.now()).slice(-4)}`,title:input.trim(),status:"DRAFT"},...p]),setInput(""))} variant="danger" style={{ minWidth:44 }}>+</Btn>
    </div>
    <div style={{ maxHeight:200,overflowY:"auto" }}>
      {tasks.map(t=><div key={t.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg2,borderRadius:4,padding:"8px 10px",marginBottom:5,border:`0.5px solid ${C.border}`,gap:8 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:9,color:"#444",fontFamily:C.fontMono }}>{t.id}</div>
          <div style={{ fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.title}</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:5,flexShrink:0 }}>
          <Badge color={SC[t.status]||"gray"} small>{t.status}</Badge>
          <button onClick={()=>setTasks(p=>p.map(x=>x.id===t.id?{...x,status:SF[x.status]}:x))} style={{ background:"transparent",border:`0.5px solid ${C.border2}`,borderRadius:3,color:"#555",cursor:"pointer",fontSize:10,padding:"3px 6px",minHeight:28,fontFamily:C.fontMono }}>▶</button>
          <button onClick={()=>setTasks(p=>p.map(x=>x.id===t.id?{...x,status:"BLOCKED"}:x))} style={{ background:"transparent",border:`0.5px solid #5a1010`,borderRadius:3,color:C.red,cursor:"pointer",fontSize:10,padding:"3px 6px",minHeight:28,fontFamily:C.fontMono }}>✗</button>
        </div>
      </div>)}
    </div>
  </Card>;
}

function SecurityPanel({ backendInfo }) {
  return <Card eyebrow="MODULE 06 / GUARDRAILS" title="SECURITY">
    {[["External network","OFF","green"],["Secrets","OFF","green"],[".env access","OFF","green"],["Git push","OFF","green"],["Shell real","OFF","green"],["Human approval","ON","green"],["Raw→ecosystem","BLOCKED","gray"],["Agents autonomous","BLOCKED","gray"],["Claude",backendInfo?.claudeProxy||"WAITING",backendInfo?.claudeProxy==="READY_WITH_KEY"?"green":"gray"],["OpenAI",backendInfo?.openaiProxy||"WAITING",backendInfo?.openaiProxy==="READY_WITH_KEY"?"green":"gray"],["Gemini",backendInfo?.geminiProxy||"WAITING",backendInfo?.geminiProxy==="READY_WITH_KEY"?"green":"gray"]].map(([l,v,c])=>(
      <Row key={l} label={l} value={<Badge color={c} small>{v}</Badge>} />
    ))}
  </Card>;
}

function MemoryPanel({ backendOnline }) {
  const [contents,setContents]=useState({});
  const [loading,setLoading]=useState(null);
  async function readFile(file) {
    setLoading(file);
    try { if (backendOnline) { const res=await authFetch(`/api/memory/${file}`); const d=await res.json(); setContents(p=>({...p,[file]:d.content||d.reason})); } else setContents(p=>({...p,[file]:"Backend offline."})); } catch { setContents(p=>({...p,[file]:"Error."})); }
    setLoading(null);
  }
  return <Card eyebrow="MODULE 05 / MEMORY" title="MEMORY">
    <Row label="L0 Session" value="active" valueColor={C.green} />
    <Row label="L1 Operative" value="runtime/logs" valueColor={C.textDim} />
    <Row label="L2 Distilled" value="knowledge/ ACTIVE" valueColor={C.amber} />
    <Row label="L3 Ecosystem" value="BLOCKED_UNTIL_KEY" valueColor="#444" />
    <div style={{ marginTop:10 }}>
      {MEMORY_FILES.map(file=><div key={file} style={{ marginBottom:6 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3 }}>
          <span style={{ fontSize:10,color:"#666",fontFamily:C.fontMono,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:8 }}>{file}</span>
          <Btn onClick={()=>readFile(file)} size="sm" variant="ghost">{loading===file?"...":"READ"}</Btn>
        </div>
        {contents[file]&&<pre style={{ background:"#050505",borderRadius:4,padding:"6px 8px",fontSize:9,color:"#666",fontFamily:C.fontMono,overflowX:"auto",maxHeight:80,border:`0.5px solid ${C.border}`,whiteSpace:"pre-wrap",wordBreak:"break-word" }}>{contents[file].slice(0,300)}</pre>}
      </div>)}
    </div>
  </Card>;
}

function ConsumptionPanel({ backendOnline }) {
  const [data,setData]=useState(null);
  const load=useCallback(async()=>{ if (!backendOnline) return; try { const res=await authFetch("/api/consumption"); setData(await res.json()); } catch {} },[backendOnline]);
  useEffect(()=>{ load(); },[load]);
  return <Card eyebrow="MODULE 07 / CONSUMPTION" title="AI USAGE" action={<Btn onClick={load} size="sm" variant="ghost">↻</Btn>}>
    {data?<>
      <Row label="Calls today" value={`${data.summary.calls_today||0} / ${data.limits.max_calls_per_day}`} />
      <Row label="Est. cost" value={`$${(data.summary.estimated_cost_usd||0).toFixed(4)}`} valueColor={C.green} />
      <Row label="Daily limit" value={`$${data.limits.max_daily_cost_usd}`} valueColor={C.textDim} />
    </>:<div style={{ fontSize:11,color:"#444",fontFamily:C.fontMono }}>{backendOnline?"Loading...":"Backend offline"}</div>}
  </Card>;
}

// ── Main App ───────────────────────────────────────────────
export default function UltronMobile() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [backendInfo, setBackendInfo] = useState(null);
  const [activeModel, setActiveModel] = useState("auto");
  const [activeTab, setActiveTab] = useState("command");

  // ── Persistent session ────────────────────────────────
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [sessionSavedAt, setSessionSavedAt] = useState(null);

  const loadSession = useCallback(async () => {
    if (!backendOnline) return;
    try {
      const res = await authFetch("/api/session/load");
      const data = await res.json();
      if (data.ok && data.exists && data.state) {
        // Restore active model if saved
        if (data.state.activeModel) setActiveModel(data.state.activeModel);
        if (data.state.activeTab) setActiveTab(data.state.activeTab);
        setSessionSavedAt(data.state._savedAt || null);
        setSessionLoaded(true);
      }
    } catch { /* silent */ }
  }, [backendOnline]);

  const saveSession = useCallback(async () => {
    if (!backendOnline) return;
    try {
      await authFetch("/api/session/save", {
        method: "POST",
        body: JSON.stringify({ state: { activeModel, activeTab, _client: "UltronMobile" } })
      });
      setSessionSavedAt(new Date().toISOString());
    } catch { /* silent */ }
  }, [backendOnline, activeModel, activeTab]);

  // Load session when backend comes online
  useEffect(() => { if (backendOnline && !sessionLoaded) loadSession(); }, [backendOnline, sessionLoaded, loadSession]);

  // Auto-save session every 60 seconds
  useEffect(() => {
    if (!backendOnline) return;
    const interval = setInterval(saveSession, 60000);
    return () => clearInterval(interval);
  }, [backendOnline, saveSession]);



  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) { const d = await res.json(); setBackendOnline(true); setBackendInfo(d); }
      else setBackendOnline(false);
    } catch { setBackendOnline(false); }
    setChecking(false);
  }, []);

  useEffect(() => { checkHealth(); const i = setInterval(checkHealth, 12000); return () => clearInterval(i); }, [checkHealth]);

  function handleVoiceCommand(action) {
    if (action === "status") setActiveTab("command");
    if (action === "meeting") setActiveTab("meetings");
    if (action === "distill") setActiveTab("knowledge");
    if (action === "agents") setActiveTab("agents");
  }

  return <>
    <style>{css}</style>
    <div className="scanline" />
    <div style={{ minHeight:"100vh", background:C.bg }}>

      {/* Header */}
      <header style={{ background:C.bg1,borderBottom:`0.5px solid ${C.border}`,padding:"0 16px",position:"sticky",top:0,zIndex:100,height:52,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ fontSize:20,fontWeight:700,color:C.red,letterSpacing:"0.14em",fontFamily:C.fontUI }}>ULTRON</span>
          <Badge color="gray">v2.7</Badge>
          <Badge color="amber">AETHERNOVA</Badge>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
            <Dot on={backendOnline} pulse={backendOnline} />
            <span style={{ fontSize:9,color:checking?"#444":backendOnline?C.red:"#444",fontFamily:C.fontMono }}>{checking?"CHK":backendOnline?"ONLINE":"OFFLINE"}</span>
          </div>
          <button onClick={saveSession} title="Save session" style={{ background:"transparent",border:`0.5px solid ${C.border}`,borderRadius:3,color:"#333",cursor:"pointer",fontSize:10,padding:"3px 7px",fontFamily:C.fontMono }}>💾</button>
          <button onClick={checkHealth} style={{ background:"transparent",border:`0.5px solid ${C.border}`,borderRadius:3,color:"#444",cursor:"pointer",fontSize:10,padding:"3px 7px",fontFamily:C.fontMono }}>↻</button>
        </div>
      </header>

      {/* Offline banner */}
      {!checking&&!backendOnline&&<div style={{ background:"#0d0505",borderBottom:`0.5px solid #3a0a0a`,padding:"8px 16px",textAlign:"center" }}>
        <span style={{ fontSize:10,color:C.red,fontFamily:C.fontMono }}>Backend offline — <code style={{ background:"#1a0505",padding:"1px 5px",borderRadius:2 }}>cd app && npm run backend</code></span>
      </div>}

      {/* Tabs */}
      <nav style={{ background:C.bg1,borderBottom:`0.5px solid ${C.border}`,padding:"0 12px",display:"flex",gap:0,overflowX:"auto" }}>
        {TABS.map(tab=><button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ background:"transparent",border:"none",borderBottom:`2px solid ${activeTab===tab.id?C.red:"transparent"}`,padding:"10px 12px",cursor:"pointer",color:activeTab===tab.id?C.red:"#555",fontFamily:C.fontMono,fontSize:9,letterSpacing:"0.08em",whiteSpace:"nowrap",transition:"all 0.15s" }}>{tab.icon} {tab.label}</button>)}
      </nav>

      {/* Content */}
      <main style={{ maxWidth:1100,margin:"0 auto",padding:12 }}>

        {activeTab === "command" && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:12,alignItems:"start" }}>
            <div>
              <ChatPanel backendOnline={backendOnline} activeModel={activeModel} setActiveModel={setActiveModel} />
              <VoicePanel />
              <CommandPanel backendOnline={backendOnline} />
            </div>
            <div>
              <TaskQueue />
              <MemoryPanel backendOnline={backendOnline} />
              <SecurityPanel backendInfo={backendInfo} />
              <ConsumptionPanel backendOnline={backendOnline} />
            </div>
          </div>
        )}

        {activeTab === "workspace" && <WorkspacePanel />}
        {activeTab === "meetings" && <MeetingPanel backendOnline={backendOnline} />}
        {activeTab === "knowledge" && <KnowledgePanel backendOnline={backendOnline} />}
        {activeTab === "agents" && <AgentsPanel backendOnline={backendOnline} />}
        {activeTab === "ecosystem" && <EcosystemPanel />}
        {activeTab === "voice" && <VoiceCompanion onCommand={handleVoiceCommand} backendOnline={backendOnline} />}
        {activeTab === "tools" && <ExternalToolsPanel />}
        {activeTab === "photo" && <PhotoPanel backendOnline={backendOnline} />}

        {/* Footer */}
        <div style={{ marginTop:12,padding:"12px 16px",background:C.bg1,border:`0.5px solid ${C.border}`,borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
          <span style={{ fontSize:9,color:C.red,fontFamily:C.fontMono,letterSpacing:"0.1em" }}>ULTRON v2.7 — AETHERNOVA FULL OPERATOR STACK</span>
          <span style={{ fontSize:9,color:"#333",fontFamily:C.fontMono }}>NEXT → FINAL: KEYS + CONSUMPTION LOGIC</span>
        </div>
      </main>
    </div>
  </>;
}
