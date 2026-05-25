import React, { useState, useEffect, useRef } from "react";

const C = {
  bg1: "#0d0d0d", bg2: "#111", bg3: "#0a0a0a",
  border: "#1e1e1e", border2: "#2a2a2a",
  red: "#c0392b", redGlow: "rgba(192,57,43,0.15)",
  text: "#e8e8e8", textDim: "#888",
  green: "#27ae60", amber: "#e67e22",
  fontMono: "'Share Tech Mono', monospace"
};

const VOICE_COMMANDS = [
  { trigger: ["status", "estado"], action: "status", desc: "System status" },
  { trigger: ["new task", "nueva tarea", "tarea"], action: "new_task", desc: "Add a task" },
  { trigger: ["process meeting", "procesar reunión", "reunión"], action: "meeting", desc: "Open meeting processor" },
  { trigger: ["distill", "destilar", "conocimiento"], action: "distill", desc: "Open knowledge distiller" },
  { trigger: ["clear", "limpiar"], action: "clear", desc: "Clear transcript" },
  { trigger: ["help", "ayuda"], action: "help", desc: "Show commands" }
];

const BT_GLASSES = [
  { brand: "Ray-Ban Meta", price: "$299", mic: "✓", audio: "✓", note: "Best option. Works via phone." },
  { brand: "Bose Frames", price: "$199", mic: "✗", audio: "✓", note: "Audio only. No mic." },
  { brand: "Generic BT Glasses", price: "$30-80", mic: "✓", audio: "✓", note: "Budget. Variable quality." },
  { brand: "Any BT Headset", price: "$20+", mic: "✓", audio: "✓", note: "Use phone browser + headset." }
];

export default function VoiceCompanion({ onCommand, backendOnline }) {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState(null);
  const [history, setHistory] = useState([]);
  const [supported, setSupported] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.lang = "es-MX";
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) processCommand(t);
    };
    rec.onend = () => { if (!continuous) setStatus("idle"); };
    rec.onerror = () => setStatus("error");
    recRef.current = rec;
  }, [continuous]);

  function processCommand(text) {
    const lower = text.toLowerCase().trim();
    for (const cmd of VOICE_COMMANDS) {
      if (cmd.trigger.some(t => lower.includes(t))) {
        const entry = { id: Date.now(), command: cmd.action, text, timestamp: new Date().toLocaleTimeString() };
        setLastCommand(cmd);
        setHistory(prev => [entry, ...prev].slice(0, 10));
        onCommand && onCommand(cmd.action, text);
        speak(`Command received: ${cmd.desc}`);
        return;
      }
    }
    setHistory(prev => [{ id: Date.now(), command: "unknown", text, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.pitch = 0.3; utt.rate = 0.85; utt.lang = "es-MX";
    window.speechSynthesis.speak(utt);
  }

  function startListening() {
    if (!recRef.current) return;
    setTranscript(""); setStatus("listening");
    recRef.current.continuous = continuous;
    recRef.current.start();
  }

  function stopListening() {
    recRef.current?.stop(); setStatus("idle");
  }

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 13 / VOICE COMPANION</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.red, fontWeight: 600, fontFamily: C.fontMono }}>VOICE COMPANION MODE</div>
        <span style={{ fontSize: 9, color: status === "listening" ? C.red : "#444", fontFamily: C.fontMono, background: C.bg2, padding: "2px 7px", borderRadius: 3 }}>
          {status === "listening" ? "● ACTIVE" : "○ STANDBY"}
        </span>
      </div>

      {!supported ? (
        <div style={{ fontSize: 11, color: "#555", fontFamily: C.fontMono }}>Web Speech API not supported. Use Chrome/Safari.</div>
      ) : (
        <>
          {/* Controls */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button onClick={startListening} disabled={status === "listening"} style={{
              flex: 1, background: status === "listening" ? C.redGlow : C.red,
              border: `0.5px solid ${C.red}`, borderRadius: 4, color: "#fff",
              fontFamily: C.fontMono, fontSize: 11, padding: "10px", cursor: status === "listening" ? "not-allowed" : "pointer",
              minHeight: 44, opacity: status === "listening" ? 0.7 : 1
            }}>
              {status === "listening" ? "🎙 LISTENING..." : "🎙 START VOICE"}
            </button>
            <button onClick={stopListening} style={{ background: "transparent", border: `0.5px solid ${C.border2}`, borderRadius: 4, color: C.textDim, fontFamily: C.fontMono, fontSize: 11, padding: "10px 14px", cursor: "pointer", minHeight: 44 }}>■ STOP</button>
            <button onClick={() => { setContinuous(!continuous); }} style={{ background: continuous ? C.redGlow : "transparent", border: `0.5px solid ${continuous ? C.red : C.border2}`, borderRadius: 4, color: continuous ? C.red : C.textDim, fontFamily: C.fontMono, fontSize: 9, padding: "10px 8px", cursor: "pointer", minHeight: 44 }}>
              {continuous ? "CONT ON" : "CONT OFF"}
            </button>
          </div>

          {/* Transcript */}
          <div style={{ background: C.bg3, borderRadius: 4, padding: "10px 12px", minHeight: 44, fontSize: 12, color: transcript ? C.text : "#333", fontFamily: C.fontMono, border: `0.5px solid ${C.border}`, lineHeight: 1.6, marginBottom: 10 }}>
            {transcript || "Say a command..."}
          </div>

          {/* Last command */}
          {lastCommand && (
            <div style={{ background: "#0a1f0a", borderRadius: 4, padding: "8px 10px", border: `0.5px solid ${C.green}`, marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: C.green, fontFamily: C.fontMono }}>✓ COMMAND DETECTED: {lastCommand.action.toUpperCase()} — {lastCommand.desc}</span>
            </div>
          )}

          {/* Available commands */}
          <div style={{ background: C.bg2, borderRadius: 4, padding: "10px", border: `0.5px solid ${C.border}`, marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 6 }}>AVAILABLE COMMANDS (es-MX / EN)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {VOICE_COMMANDS.map(cmd => (
                <div key={cmd.action} style={{ background: C.bg3, borderRadius: 3, padding: "5px 7px" }}>
                  <div style={{ fontSize: 9, color: C.red, fontFamily: C.fontMono }}>{cmd.trigger[0]}</div>
                  <div style={{ fontSize: 8, color: "#444", fontFamily: C.fontMono }}>{cmd.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 6 }}>COMMAND HISTORY</div>
              {history.slice(0, 5).map(h => (
                <div key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `0.5px solid ${C.border}` }}>
                  <span style={{ fontSize: 10, color: h.command === "unknown" ? "#444" : C.green, fontFamily: C.fontMono }}>{h.command === "unknown" ? "?" : "✓"} {h.text.slice(0, 40)}</span>
                  <span style={{ fontSize: 9, color: "#333", fontFamily: C.fontMono }}>{h.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* BT Glasses setup */}
      <button onClick={() => setShowSetup(!showSetup)} style={{ width: "100%", background: "transparent", border: `0.5px solid ${C.border2}`, borderRadius: 4, color: C.textDim, fontFamily: C.fontMono, fontSize: 10, padding: "8px", cursor: "pointer", marginBottom: showSetup ? 10 : 0 }}>
        {showSetup ? "✕ HIDE BT GLASSES SETUP" : "🥽 BT GLASSES SETUP GUIDE"}
      </button>

      {showSetup && (
        <div style={{ background: C.bg2, borderRadius: 4, padding: "12px", border: `0.5px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.amber, fontFamily: C.fontMono, marginBottom: 10 }}>HOW TO USE ULTRON WITH BLUETOOTH GLASSES</div>
          <div style={{ fontSize: 10, color: "#777", fontFamily: C.fontMono, lineHeight: 1.7, marginBottom: 10 }}>
            1. Connect BT glasses/headset to your phone<br />
            2. Open tony-rip-orpin.vercel.app in Chrome<br />
            3. Go to Voice Companion tab<br />
            4. Tap START VOICE<br />
            5. Speak commands — ULTRON responds via speaker<br />
            6. Enable CONT mode for hands-free continuous listening
          </div>
          <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 8 }}>COMPATIBLE HARDWARE</div>
          {BT_GLASSES.map(g => (
            <div key={g.brand} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", borderBottom: `0.5px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 10, color: C.text, fontFamily: C.fontMono }}>{g.brand}</div>
                <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{g.note}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                <div style={{ fontSize: 10, color: C.green, fontFamily: C.fontMono }}>{g.price}</div>
                <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>mic:{g.mic} audio:{g.audio}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
