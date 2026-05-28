import React, { useState, useEffect, useRef, useCallback } from "react";
import WorkspacePanel from "./WorkspacePanel";
import MeetingPanel from "./MeetingPanel";
import KnowledgePanel from "./KnowledgePanel";
import AgentsPanel from "./AgentsPanel";
import EcosystemPanel from "./EcosystemPanel";
import VoiceCompanion from "./VoiceCompanion";
import PhotoPanel from "./PhotoPanel";
import CostsDashboard from "./CostsDashboard";
import NebulaOrb from "./NebulaOrb";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "" : "http://localhost:3001");
const TOKEN = import.meta.env.VITE_ULTRON_TOKEN || "ULTRON_LOCAL_OPERATOR_TOKEN";

const COMMAND_ALLOWLIST = [
  "pwd","git status","git log --oneline -5","git diff --stat","npm run build","find . -maxdepth 2 -type f"
];
const MEMORY_FILES = [
  "operator_command_log.md","v1_1_real_operator_testing_snapshot.json","runtime_config.json"
];

const ACTION_PATTERNS = [
  { tag:"[ACTION:MEETING]", trigger:/\b(reunión|meeting|minuta|transcri)/i, tab:"meetings" },
  { tag:"[ACTION:DISTILL]", trigger:/\b(destila|distill|conocimiento|knowledge)\b/i, tab:"knowledge" },
  { tag:"[ACTION:AGENTS]", trigger:/\b(agente|agent|tarea|task|ejecuta)\b/i, tab:"agents" },
  { tag:"[ACTION:WORKSPACE]", trigger:/\b(workspace|carpeta|folder|archivo|file)\b/i, tab:"workspace" },
  { tag:"[ACTION:ECOSYSTEM]", trigger:/\b(ecosistema|ecosystem|ruta|route|coco|aether)\b/i, tab:"ecosystem" },
  { tag:"[ACTION:COSTS]", trigger:/\b(costo|cost|consumo|budget|presupuesto)\b/i, tab:"costs" },
  { tag:"[ACTION:PHOTO]", trigger:/\b(foto|photo|imagen|image|captura|capture)\b/i, tab:"photo" }
];

function detectAction(message) {
  for (const p of ACTION_PATTERNS) { if (p.trigger.test(message)) return p; }
  return null;
}

function authFetch(path, options = {}) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { "Content-Type":"application/json","x-ultron-token":TOKEN,...(options.headers||{}) }
  });
}

const C = {
  bg:"#050505",bg1:"#0a0a0a",bg2:"#0f0f0f",bg3:"#070707",
  red:"#c0392b",redDim:"#7a1a13",redGlow:"rgba(192,57,43,0.12)",
  border:"#1a1a1a",border2:"#242424",
  text:"#e8e8e8",textDim:"#777",textFaint:"#333",
  green:"#27ae60",amber:"#e67e22",
  fontMono:"'Share Tech Mono','Courier New',monospace",
  fontUI:"'Rajdhani','Share Tech Mono',monospace"
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};color:${C.text};font-family:${C.fontUI};-webkit-font-smoothing:antialiased;overflow-x:hidden;}
  ::-webkit-scrollbar{width:2px;height:2px;}
  ::-webkit-scrollbar-thumb{background:#3a0808;border-radius:2px;}
  input,textarea,button,select{font-family:inherit;}
  input::placeholder,textarea::placeholder{color:${C.textFaint};}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes spinReverse{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
  @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
  @keyframes bootFlash{0%{opacity:0}10%{opacity:1}90%{opacity:1}100%{opacity:0}}
  @keyframes waveform{0%,100%{height:4px}50%{height:20px}}
  @keyframes ring1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes ring2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
  @keyframes ring3{from{transform:rotate(15deg)}to{transform:rotate(375deg)}}
  @keyframes pulseOut{0%{transform:scale(1);opacity:0.6}100%{transform:scale(3.2);opacity:0}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes contextIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes orbIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
  .msg-in{animation:slideUp 0.2s ease;}
  .scanline{position:fixed;top:0;left:0;right:0;height:1px;background:linear-gradient(transparent,rgba(192,57,43,0.12),transparent);animation:scanline 7s linear infinite;pointer-events:none;z-index:9999;opacity:0.3;}
  .orb-view{animation:orbIn 0.4s ease;}
  .ctx-view{animation:contextIn 0.3s ease;}
`;

// ── Boot Screen ──────────────────────────────────────────
function BootScreen({ onComplete }) {
  const [line, setLine] = useState(0);
  const lines = [
    "INITIALIZING ULTRON CORE...","LOADING AETHERNOVA STACK...",
    "ACTIVATING KNOWLEDGE OPERATOR...","GUARDRAILS ENGAGED...",
    "NEBULA ORB ONLINE","SYSTEM READY"
  ];
  useEffect(() => {
    if (line < lines.length) { const t = setTimeout(() => setLine(l=>l+1), 280); return ()=>clearTimeout(t); }
    else { const t = setTimeout(onComplete, 400); return ()=>clearTimeout(t); }
  }, [line]);
  return (
    <div style={{ position:"fixed",inset:0,background:"#020208",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
      <div style={{ position:"relative",width:100,height:100,marginBottom:36 }}>
        <div style={{ position:"absolute",inset:0,border:"0.5px solid #1e90ff",borderRadius:"50%",animation:"spin 4s linear infinite",opacity:0.5 }}/>
        <div style={{ position:"absolute",inset:10,border:"0.5px solid rgba(30,144,255,0.3)",borderRadius:"50%",animation:"spinReverse 3s linear infinite" }}/>
        <div style={{ position:"absolute",inset:22,border:"0.5px solid #1e90ff",borderRadius:"50%",animation:"spin 2s linear infinite",opacity:0.7 }}/>
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <span style={{ fontFamily:C.fontMono,fontSize:9,color:"#1e90ff",letterSpacing:2 }}>ULTRON</span>
        </div>
      </div>
      <div style={{ width:"min(320px,88vw)" }}>
        {lines.slice(0,line).map((l,i) => (
          <div key={i} className="msg-in" style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
            <span style={{ color:"#1e90ff",fontFamily:C.fontMono,fontSize:9 }}>▶</span>
            <span style={{ fontFamily:C.fontMono,fontSize:9,color:i===line-1?"#1e90ff":C.textDim,letterSpacing:1 }}>{l}</span>
            {i===line-1 && <span style={{ fontFamily:C.fontMono,fontSize:9,color:"#1e90ff",animation:"blink 0.6s infinite" }}>▋</span>}
          </div>
        ))}
      </div>
      <div style={{ width:"min(320px,88vw)",height:1,background:"#0a0a0a",marginTop:18,borderRadius:1,overflow:"hidden" }}>
        <div style={{ height:"100%",background:"#1e90ff",width:`${(line/lines.length)*100}%`,transition:"width 0.28s ease",boxShadow:"0 0 8px #1e90ff" }}/>
      </div>
    </div>
  );
}

// ── Waveform ─────────────────────────────────────────────
function Waveform({ active, color="#c0392b" }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:2,height:28,padding:"0 4px" }}>
      {Array.from({length:18}).map((_,i) => (
        <div key={i} style={{
          width:2,borderRadius:1,background:color,
          height:active?"100%":3,
          opacity:active?0.5+Math.sin(i*0.8)*0.4:0.15,
          animation:active?`waveform ${0.4+(i%5)*0.1}s ease-in-out ${i*0.05}s infinite alternate`:"none",
          transition:"height 0.3s"
        }}/>
      ))}
    </div>
  );
}

// ── Badge / Btn / Card / Row ─────────────────────────────
function Badge({ children, color="red", small }) {
  const p={red:{bg:"#0f0202",text:C.red,border:"#3a0808"},green:{bg:"#020f04",text:C.green,border:"#0a3a15"},amber:{bg:"#0f0802",text:C.amber,border:"#3a2008"},gray:{bg:"#0f0f0f",text:C.textDim,border:"#1e1e1e"},blue:{bg:"#020810",text:"#1e90ff",border:"#0a1a3a"}}[color]||{bg:"#0f0f0f",text:C.textDim,border:"#1e1e1e"};
  return <span style={{ background:p.bg,color:p.text,border:`0.5px solid ${p.border}`,borderRadius:2,padding:small?"1px 5px":"2px 8px",fontSize:small?8:9,fontFamily:C.fontMono,letterSpacing:"0.1em",fontWeight:500,whiteSpace:"nowrap" }}>{children}</span>;
}
function Btn({ children,onClick,variant="ghost",disabled,style={},size="md" }) {
  const v={primary:{background:C.red,border:`0.5px solid ${C.red}`,color:"#fff"},ghost:{background:"transparent",border:`0.5px solid ${C.border2}`,color:C.textDim},active:{background:C.redGlow,border:`0.5px solid ${C.red}`,color:C.red},blue:{background:"rgba(30,144,255,0.08)",border:"0.5px solid rgba(30,144,255,0.3)",color:"#1e90ff"}}[variant];
  const s={sm:{padding:"4px 10px",fontSize:9,minHeight:30},md:{padding:"8px 16px",fontSize:10,minHeight:44}}[size];
  return <button onClick={onClick} disabled={disabled} style={{ ...v,...s,borderRadius:3,cursor:disabled?"not-allowed":"pointer",fontFamily:C.fontMono,letterSpacing:"0.06em",opacity:disabled?0.35:1,transition:"all 0.15s",...style }}>{children}</button>;
}
function Card({ title,eyebrow,children,style={},action }) {
  return <div style={{ background:C.bg1,borderRadius:4,border:`0.5px solid ${C.border}`,padding:"11px 13px",marginBottom:8,...style }}>
    {(eyebrow||action)&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:title?3:9 }}>{eyebrow&&<span style={{ fontSize:8,color:"#1e1e1e",letterSpacing:"0.16em",fontFamily:C.fontMono }}>{eyebrow}</span>}{action}</div>}
    {title&&<div style={{ fontSize:11,color:C.red,fontWeight:600,marginBottom:9,fontFamily:C.fontMono,letterSpacing:"0.08em" }}>{title}</div>}
    {children}
  </div>;
}
function Row({ label,value,valueColor }) {
  return <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`0.5px solid ${C.border}` }}>
    <span style={{ fontSize:10,color:C.textDim,fontFamily:C.fontMono }}>{label}</span>
    <span style={{ fontSize:10,color:valueColor||C.text,fontFamily:C.fontMono }}>{value}</span>
  </div>;
}

// ── ORB VIEW — pantalla principal ─────────────────────────
function OrbView({ backendOnline, activeModel, lastMessage, listening, thinking, onToggleListen, onOpenContext, orbColor }) {
  const m = {
    pro:{hex:"#1e90ff",ring:"rgba(30,144,255,",status:"PRO BRAIN MODE",model:"GPT-4o / CLAUDE"},
    strategic:{hex:"#9b59b6",ring:"rgba(155,89,182,",status:"NEBULA PROTOCOL",model:"SONNET / GEMINI"},
    alert:{hex:"#e74c3c",ring:"rgba(231,76,60,",status:"SUPERNOVA ALERT",model:"FAST RESPONSE"},
    joyful:{hex:"#2ed573",ring:"rgba(46,213,115,",status:"JOYFUL ONLINE",model:"GROQ FAST"},
    dark:{hex:"#4a4a6a",ring:"rgba(60,60,90,",status:"DARK PROTOCOL",model:"LOCAL ONLY"}
  }[orbColor] || {hex:"#1e90ff",ring:"rgba(30,144,255,",status:"PRO BRAIN MODE",model:"GPT-4o"};

  return (
    <div className="orb-view" style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",minHeight:"100vh",background:"#020208",padding:"20px 16px 100px",position:"relative" }}>

      {/* Header mini */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:340,marginBottom:24 }}>
        <div>
          <div style={{ fontSize:11,fontWeight:700,color:m.hex,letterSpacing:"0.2em",fontFamily:C.fontUI,textShadow:`0 0 12px ${m.hex}88` }}>ULTRON</div>
          <div style={{ fontSize:7,color:"rgba(255,255,255,0.15)",fontFamily:C.fontMono,letterSpacing:"0.1em" }}>KNOWLEDGE OPERATOR v2.8</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <div style={{ width:5,height:5,borderRadius:"50%",background:backendOnline?m.hex:"#1e1e1e",boxShadow:backendOnline?`0 0 6px ${m.hex}`:"none",animation:backendOnline?"pulse 2s infinite":"none" }}/>
          <span style={{ fontSize:7,color:backendOnline?m.hex:"#1e1e1e",fontFamily:C.fontMono }}>{backendOnline?"ONLINE":"OFFLINE"}</span>
        </div>
      </div>

      {/* ORB */}
      <NebulaOrb
        listening={listening}
        onToggleListen={onToggleListen}
        currentMessage={lastMessage}
        activeModel={activeModel}
        backendOnline={backendOnline}
      />

      {/* Waveform */}
      {listening && <div style={{ marginTop:8 }}><Waveform active={listening} color={m.hex}/></div>}

      {/* Status */}
      <div style={{ marginTop:16,fontSize:10,color:m.hex,fontFamily:C.fontMono,letterSpacing:"0.12em",animation:(listening||thinking)?"blink 0.8s infinite":"none" }}>
        {listening?"● LISTENING...":thinking?"◈ PROCESSING...":"○ TAP ORB TO SPEAK"}
      </div>
      <div style={{ fontSize:8,color:"rgba(255,255,255,0.15)",fontFamily:C.fontMono,marginTop:4 }}>
        {m.model} — {m.status}
      </div>

      {/* Last message preview */}
      {lastMessage && (
        <div style={{ marginTop:16,background:"rgba(255,255,255,0.03)",border:`0.5px solid rgba(255,255,255,0.07)`,borderRadius:6,padding:"8px 12px",maxWidth:320,width:"100%",textAlign:"center" }}>
          <div style={{ fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:C.fontMono,marginBottom:3 }}>LAST CONTEXT</div>
          <div style={{ fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:C.fontMono,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{lastMessage}</div>
        </div>
      )}

      {/* CONTEXT button — fixed bottom */}
      <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:100 }}>
        <button onClick={onOpenContext} style={{
          background:"rgba(255,255,255,0.04)",
          border:`0.5px solid ${m.ring}0.3)`,
          borderRadius:24,padding:"10px 28px",
          color:m.hex,fontFamily:C.fontMono,fontSize:10,
          cursor:"pointer",letterSpacing:"0.12em",
          backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
          boxShadow:`0 0 20px ${m.ring}0.15)`,
          transition:"all 0.3s"
        }}>⊞ CONTEXT</button>
      </div>
    </div>
  );
}

// ── CONTEXT VIEW — chat + tabs ────────────────────────────
function ContextView({ backendOnline, activeModel, setActiveModel, onCloseContext, orbColor }) {
  const [messages, setMessages] = useState([
    { role:"system",text:"ULTRON v2.8 — AETHERNOVA FULL OPERATOR STACK ONLINE.",ts:new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [voiceOn, setVoiceOn] = useState(true);
  const bottomRef = useRef(null);
  const recRef = useRef(null);
  const synthRef = useRef(null);

  const modeColor = {pro:"#1e90ff",strategic:"#9b59b6",alert:"#e74c3c",joyful:"#2ed573",dark:"#4a4a6a"}[orbColor]||C.red;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);
  useEffect(() => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR(); rec.continuous=false; rec.interimResults=true; rec.lang="es-MX";
    rec.onresult = e => setInput(Array.from(e.results).map(r=>r[0].transcript).join(""));
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  function speak(text) {
    if (!voiceOn) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = String(text||"").replace(/\[ACTION:[A-Z]+\]/g,"").trim().slice(0,400);
    if (!clean) return;
    const utt = new SpeechSynthesisUtterance(clean);
    utt.pitch = 0.25;
    utt.rate = 0.88;
    utt.volume = 1;
    utt.lang = "es-MX";
    // Preferir voz en español si está disponible
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith("es")) || voices.find(v => v.lang.startsWith("en"));
    if (esVoice) utt.voice = esVoice;
    synthRef.current = utt;
    window.speechSynthesis.speak(utt);
  }

  
  async function send() {
    const text = input.trim();
    if (!text||loading) return;
    if (text==="/clear") { setMessages([{role:"system",text:"Chat cleared.",ts:new Date().toLocaleTimeString()}]); setInput(""); return; }
    if (text.startsWith("/model ")) { const m=text.replace("/model ","").trim(); setActiveModel(m); setMessages(p=>[...p,{role:"system",text:`Provider: ${m.toUpperCase()}`,ts:new Date().toLocaleTimeString()}]); setInput(""); return; }

    const action = detectAction(text);
    if (action) {
      setMessages(m=>[...m,{role:"user",text,ts:new Date().toLocaleTimeString()},{role:"action",text:`${action.tag} → ${action.tab.toUpperCase()}`,tab:action.tab,ts:new Date().toLocaleTimeString()}]);
      setInput(""); setActiveTab(action.tab); return;
    }

    setMessages(m=>[...m,{role:"user",text,ts:new Date().toLocaleTimeString()}]);
    setInput(""); setLoading(true);
    try {
      if (backendOnline) {
        const res = await authFetch("/api/chat",{method:"POST",body:JSON.stringify({message:text,model:activeModel!=="auto"?activeModel:undefined})});
        const data = await res.json();
        const reply = data.message||"No response.";
        setMessages(m=>[...m,{role:"ultron",text:reply,provider:data.provider,level:data.level,ts:new Date().toLocaleTimeString()}]);
        speak(reply);
      } else {
        setMessages(m=>[...m,{role:"ultron",text:"Backend offline. Run: npm run backend",ts:new Date().toLocaleTimeString()}]);
      }
    } catch { setMessages(m=>[...m,{role:"ultron",text:"Connection failed.",ts:new Date().toLocaleTimeString()}]); }
    setLoading(false);
  }

  function toggleVoice() {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { setInput(""); setListening(true); recRef.current.start(); }
  }

  const TABS = [
    {id:"chat",label:"CHAT",icon:"💬"},{id:"workspace",label:"WORK",icon:"📁"},
    {id:"meetings",label:"MTG",icon:"🎙"},{id:"knowledge",label:"KNW",icon:"⚗"},
    {id:"agents",label:"AGT",icon:"🤖"},{id:"ecosystem",label:"ECO",icon:"🔀"},
    {id:"voice",label:"VOICE",icon:"🥽"},{id:"photo",label:"PHOTO",icon:"📷"},
    {id:"costs",label:"COSTS",icon:"💰"},{id:"tools",label:"TOOLS",icon:"🔧"}
  ];

  const models = ["auto","openai","gemini","claude","groq","ollama"];

  return (
    <div className="ctx-view" style={{ minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column" }}>

      {/* Header */}
      <header style={{ background:C.bg1,borderBottom:`0.5px solid ${C.border}`,padding:"0 12px",height:46,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <button onClick={onCloseContext} style={{ background:"transparent",border:`0.5px solid rgba(255,255,255,0.08)`,borderRadius:20,padding:"4px 12px",color:"rgba(255,255,255,0.3)",fontFamily:C.fontMono,fontSize:9,cursor:"pointer",letterSpacing:"0.08em" }}>◎ ORB</button>
        <div style={{ fontSize:10,fontWeight:600,color:modeColor,letterSpacing:"0.15em",fontFamily:C.fontUI,textShadow:`0 0 10px ${modeColor}66` }}>ULTRON</div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <button onClick={()=>{ setVoiceOn(v=>!v); window.speechSynthesis?.cancel(); }} style={{ background:voiceOn?`rgba(30,144,255,0.1)`:"transparent",border:`0.5px solid ${voiceOn?modeColor:"#2a2a2a"}`,borderRadius:20,padding:"3px 10px",color:voiceOn?modeColor:"#333",fontFamily:C.fontMono,fontSize:8,cursor:"pointer",letterSpacing:"0.06em" }}>{voiceOn?"🔊 VOZ":"🔇 MUTE"}</button>
          <div style={{ width:5,height:5,borderRadius:"50%",background:backendOnline?modeColor:"#1e1e1e",animation:backendOnline?"pulse 2s infinite":"none",boxShadow:backendOnline?`0 0 5px ${modeColor}`:"none" }}/>
          <span style={{ fontSize:7,color:backendOnline?modeColor:"#1e1e1e",fontFamily:C.fontMono }}>{backendOnline?"ONLINE":"OFFLINE"}</span>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ background:C.bg1,borderBottom:`0.5px solid ${C.border}`,display:"flex",overflowX:"auto",WebkitOverflowScrolling:"touch",flexShrink:0 }}>
        {TABS.map(tab => <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
          background:"transparent",
          borderBottom:`1.5px solid ${activeTab===tab.id?modeColor:"transparent"}`,
          borderTop:"1.5px solid transparent",borderLeft:"none",borderRight:"none",
          padding:"7px 10px",cursor:"pointer",
          color:activeTab===tab.id?modeColor:"#2a2a2a",
          fontFamily:C.fontMono,fontSize:8,letterSpacing:"0.1em",whiteSpace:"nowrap",transition:"all 0.15s"
        }}>{tab.icon} {tab.label}</button>)}
      </nav>

      {/* Content */}
      <main style={{ flex:1,overflowY:"auto",padding:10,maxWidth:1100,margin:"0 auto",width:"100%" }}>
        {activeTab==="chat" && (
          <Card eyebrow="OPERATOR CHAT">
            {/* Model selector */}
            <div style={{ display:"flex",gap:3,marginBottom:8,flexWrap:"wrap" }}>
              {models.map(m=><button key={m} onClick={()=>setActiveModel(m)} style={{
                background:activeModel===m?`rgba(${modeColor===C.red?"192,57,43":"30,144,255"},0.1)`:"transparent",
                border:`0.5px solid ${activeModel===m?modeColor:C.border}`,
                borderRadius:2,padding:"2px 7px",cursor:"pointer",
                color:activeModel===m?modeColor:"#333",fontSize:8,fontFamily:C.fontMono,letterSpacing:"0.08em"
              }}>{m.toUpperCase()}</button>)}
            </div>

            {/* Messages */}
            <div style={{ height:220,overflowY:"auto",background:C.bg3,borderRadius:3,padding:"8px 10px",marginBottom:8,border:`0.5px solid ${C.border}` }}>
              {messages.map((m,i) => <div key={i} className="msg-in" style={{ marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:1 }}>
                  <span style={{ fontSize:8,color:m.role==="user"?modeColor:m.role==="action"?C.amber:m.role==="system"?"#222":"#333",fontFamily:C.fontMono,letterSpacing:"0.06em" }}>
                    {m.role==="user"?"▶ CHIEF":m.role==="action"?"⚡ ACTION":m.role==="system"?"SYS":`◀ ULTRON${m.provider?` [${m.provider}]`:""}`}
                  </span>
                  <span style={{ fontSize:7,color:"#1e1e1e",fontFamily:C.fontMono }}>{m.ts}</span>
                </div>
                <div style={{ fontSize:11,color:m.role==="user"?C.text:m.role==="action"?C.amber:m.role==="system"?"#333":"#999",lineHeight:1.6 }}>
                  {m.text}
                  {m.role==="ultron"&&<button onClick={()=>speak(m.text)} style={{marginLeft:6,fontSize:9,color:"#444",background:"transparent",border:"none",cursor:"pointer"}} title="Reproducir">🔊</button>}{m.tab&&<button onClick={()=>setActiveTab(m.tab)} style={{ marginLeft:8,fontSize:8,color:C.amber,background:"transparent",border:`0.5px solid ${C.amber}`,borderRadius:2,padding:"1px 5px",cursor:"pointer",fontFamily:C.fontMono }}>→ GO</button>}
                  {m.role==="ultron"&&<button onClick={()=>speak(m.text)} style={{ marginLeft:8,fontSize:9,color:"#444",background:"transparent",border:"none",cursor:"pointer",padding:"0 2px" }} title="Reproducir">🔊</button>}
                </div>
              </div>)}
              {loading&&<div style={{ fontSize:11,color:modeColor,fontFamily:C.fontMono }}>◀ ULTRON&gt; <span style={{ animation:"blink 0.7s infinite" }}>▋</span></div>}
              <div ref={bottomRef}/>
            </div>

            {listening&&<div style={{ marginBottom:6 }}><Waveform active={listening} color={modeColor}/></div>}

            {/* Input */}
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={toggleVoice} style={{
                background:listening?`rgba(${modeColor===C.red?"192,57,43":"30,144,255"},0.1)`:"transparent",
                border:`0.5px solid ${listening?modeColor:C.border2}`,
                borderRadius:3,color:listening?modeColor:C.textDim,
                fontFamily:C.fontMono,fontSize:14,padding:"0 12px",cursor:"pointer",minHeight:44
              }}>🎙</button>
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                placeholder="/model · Ask ULTRON..."
                style={{ flex:1,background:C.bg2,border:`0.5px solid ${listening?modeColor:C.border2}`,borderRadius:3,padding:"10px 12px",color:C.text,fontFamily:C.fontMono,fontSize:11,outline:"none",minHeight:44 }}/>
              <Btn onClick={send} variant="primary" style={{ minWidth:48,fontSize:14,background:modeColor,borderColor:modeColor }}>▶</Btn>
            </div>
          </Card>
        )}
        {activeTab==="workspace"&&<WorkspacePanel backendOnline={backendOnline}/>}
        {activeTab==="meetings"&&<MeetingPanel backendOnline={backendOnline}/>}
        {activeTab==="knowledge"&&<KnowledgePanel backendOnline={backendOnline}/>}
        {activeTab==="agents"&&<AgentsPanel backendOnline={backendOnline}/>}
        {activeTab==="ecosystem"&&<EcosystemPanel backendOnline={backendOnline}/>}
        {activeTab==="voice"&&<VoiceCompanion backendOnline={backendOnline}/>}
        {activeTab==="photo"&&<PhotoPanel backendOnline={backendOnline}/>}
        {activeTab==="costs"&&<CostsDashboard backendOnline={backendOnline}/>}
        {activeTab==="tools"&&(
          <Card eyebrow="07 / TOOL REGISTRY">
            {[
              {name:"Fish Audio TTS",use:"Voice premium — alt ElevenLabs",status:"ACTIVE",sprint:"v2.8"},
              {name:"Groq llama-3.1-8b",use:"Free ultra-fast AI — Nivel 2a",status:"ACTIVE",sprint:"v2.7"},
              {name:"SQLite Memory",use:"Persistent knowledge store",status:"ACTIVE",sprint:"v2.8"},
              {name:"Action Tags",use:"Auto-navigate from chat",status:"ACTIVE",sprint:"v2.7"},
              {name:"whisper.cpp",use:"Local audio transcription",status:"PLANNED",sprint:"v2.9"},
              {name:"mem0",use:"Agent persistent memory",status:"PLANNED",sprint:"v2.9"},
              {name:"Ollama Qwen2.5",use:"Local private LLM",status:"READY",sprint:"v1.8"}
            ].map(t=>(
              <div key={t.name} style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"5px 0",borderBottom:`0.5px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize:10,color:C.text,fontFamily:C.fontMono }}>{t.name}</div>
                  <div style={{ fontSize:8,color:"#333",fontFamily:C.fontMono }}>{t.use}</div>
                </div>
                <Badge color={t.status==="ACTIVE"?"green":t.status==="READY"?"blue":"gray"} small>{t.status}</Badge>
              </div>
            ))}
          </Card>
        )}
      </main>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────
export default function UltronMobile() {
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState("orb"); // "orb" | "context"
  const [backendOnline, setBackendOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeModel, setActiveModel] = useState("auto");
  const [listening, setListening] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [orbColor, setOrbColor] = useState("pro");
  const [orbThinking, setOrbThinking] = useState(false);
  const recRef = useRef(null);
  const orbSynthRef = useRef(null);

  function orbSpeak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = String(text||"").replace(/\[ACTION:[A-Z]+\]/g,"").trim().slice(0,400);
    if (!clean) return;
    const utt = new SpeechSynthesisUtterance(clean);
    utt.pitch = 0.25; utt.rate = 0.88; utt.volume = 1; utt.lang = "es-MX";
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith("es")) || voices.find(v => v.lang.startsWith("en"));
    if (esVoice) utt.voice = esVoice;
    orbSynthRef.current = utt;
    window.speechSynthesis.speak(utt);
  }

  async function orbSendMessage(text) {
    if (!text || orbThinking) return;
    setOrbThinking(true);
    try {
      if (backendOnline) {
        const res = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-ultron-token": TOKEN },
          body: JSON.stringify({ message: text, model: activeModel !== "auto" ? activeModel : undefined })
        });
        const data = await res.json();
        const reply = data.message || "Sin respuesta.";
        setLastMessage(reply);
        orbSpeak(reply);
      } else {
        orbSpeak("Backend offline. Inicia el servidor.");
      }
    } catch { orbSpeak("Error de conexión."); }
    setOrbThinking(false);
  }

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`,{signal:AbortSignal.timeout(2500)});
      if (res.ok) setBackendOnline(true); else setBackendOnline(false);
    } catch { setBackendOnline(false); }
    setChecking(false);
  }, []);

  useEffect(() => { checkHealth(); const i=setInterval(checkHealth,12000); return()=>clearInterval(i); }, [checkHealth]);

  // Voice recognition for orb view
  useEffect(() => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR(); rec.continuous=false; rec.interimResults=true; rec.lang="es-MX";
    let finalText = "";
    rec.onresult = e => {
      const t = Array.from(e.results).map(r=>r[0].transcript).join("");
      setLastMessage(t);
      if (e.results[e.results.length-1].isFinal) finalText = t;
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) orbSendMessage(finalText.trim());
      finalText = "";
    };
    recRef.current = rec;
  }, [backendOnline, activeModel, orbThinking]);

  // Detect orb color from last message
  useEffect(() => {
    if (!lastMessage) return;
    const t = lastMessage.toLowerCase();
    if (/anal[iy]|archit|código|code|debug|diseña/.test(t)) setOrbColor("pro");
    else if (/estrateg|decisi|planif|ecosistem|aether/.test(t)) setOrbColor("strategic");
    else if (/urgen|alert|riesgo|peligr|crítico|error/.test(t)) setOrbColor("alert");
    else if (/jaja|chiste|gracioso|divert|feliz|cool|genial/.test(t)) setOrbColor("joyful");
    else if (/secreto|privado|confidenci|restringid/.test(t)) setOrbColor("dark");
  }, [lastMessage]);

  // Detect from activeModel
  useEffect(() => {
    if (["openai","claude"].includes(activeModel)) setOrbColor("pro");
    else if (activeModel==="gemini") setOrbColor("strategic");
    else if (activeModel==="groq") setOrbColor("joyful");
    else if (activeModel==="ollama") setOrbColor("dark");
  }, [activeModel]);

  function toggleListen() {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { setLastMessage(""); setListening(true); recRef.current.start(); }
  }

  if (!booted) return <BootScreen onComplete={() => setBooted(true)} />;

  return <>
    <style>{css}</style>
    <div className="scanline"/>

    {view === "orb" ? (
      <OrbView
        backendOnline={backendOnline}
        activeModel={activeModel}
        lastMessage={lastMessage}
        listening={listening}
        thinking={orbThinking}
        onToggleListen={toggleListen}
        onOpenContext={() => setView("context")}
        orbColor={orbColor}
      />
    ) : (
      <ContextView
        backendOnline={backendOnline}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
        onCloseContext={() => setView("orb")}
        orbColor={orbColor}
      />
    )}
  </>;
}
