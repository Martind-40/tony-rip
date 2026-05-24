import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";

const BACKEND_URL = "http://localhost:3001";
const TOKEN = "ULTRON_LOCAL_OPERATOR_TOKEN";

const COMMAND_ALLOWLIST = [
  "pwd",
  "git status",
  "git log --oneline -5",
  "git diff --stat",
  "npm run build",
  "find . -maxdepth 2 -type f"
];

const MEMORY_FILES = [
  "operator_command_log.md",
  "v1_1_real_operator_testing_snapshot.json",
  "runtime_config.json"
];

function authFetch(path, options = {}) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-ultron-token": TOKEN,
      ...(options.headers || {})
    }
  });
}

function StatusDot({ on }) {
  return (
    <span style={{
      display: "inline-block",
      width: 8, height: 8,
      borderRadius: "50%",
      background: on ? "#c0392b" : "#444",
      marginRight: 6,
      flexShrink: 0
    }} />
  );
}

function Badge({ children, color = "red" }) {
  const colors = {
    red: { bg: "#2a0a0a", text: "#e74c3c", border: "#5a1010" },
    green: { bg: "#0a1f0a", text: "#27ae60", border: "#1a4a1a" },
    gray: { bg: "#1a1a1a", text: "#888", border: "#333" },
    amber: { bg: "#1f1500", text: "#e67e22", border: "#4a3000" }
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.text,
      border: `0.5px solid ${c.border}`,
      borderRadius: 3, padding: "2px 7px",
      fontSize: 10, fontFamily: "'Share Tech Mono', monospace",
      letterSpacing: "0.08em", fontWeight: 500
    }}>{children}</span>
  );
}

function Panel({ title, eyebrow, children, style = {} }) {
  return (
    <div style={{
      background: "#0d0d0d",
      border: "0.5px solid #2a2a2a",
      borderRadius: 6,
      padding: "16px",
      marginBottom: 12,
      ...style
    }}>
      {eyebrow && (
        <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.12em", marginBottom: 4, fontFamily: "'Share Tech Mono', monospace" }}>
          {eyebrow}
        </div>
      )}
      {title && (
        <div style={{ fontSize: 13, color: "#c0392b", fontWeight: 500, marginBottom: 12, fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.04em" }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function ChatPanel({ backendOnline, aiStatus, activeModel, setActiveModel }) {
  const [messages, setMessages] = useState([
    { role: "system", text: "ULTRON v1.5 — Secure AI Proxy. Use /model claude, /model openai or /clear." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    if (text.toLowerCase() === "/clear") {
      setMessages([{ role: "system", text: "Chat cleared. ULTRON remains in controlled local mode." }]);
      setInput("");
      return;
    }

    if (text.toLowerCase() === "/model claude") {
      setActiveModel("claude");
      setMessages(m => [...m, { role: "system", text: "Model switched to CLAUDE." }]);
      setInput("");
      return;
    }

    if (text.toLowerCase() === "/model gpt4" || text.toLowerCase() === "/model openai") {
      setActiveModel("openai");
      setMessages(m => [...m, { role: "system", text: "Model switched to OPENAI." }]);
      setInput("");
      return;
    }

    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      if (backendOnline) {
        const res = await authFetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ message: text, provider: activeModel })
        });
        const data = await res.json();
        const label = data.model || data.provider || "STUB";
        const responseText = data.status === "WAITING_FOR_KEY"
          ? `${(data.provider || activeModel).toUpperCase()} Proxy waiting for secure key.`
          : data.message || data.reason || "No response.";
        setMessages(m => [...m, { role: "ultron", text: `[${label}] ${responseText}` }]);
      } else {
        setMessages(m => [...m, { role: "ultron", text: "Backend offline. Start backend with: npm run backend" }]);
      }
    } catch {
      setMessages(m => [...m, { role: "ultron", text: "Backend offline. Start backend with: npm run backend" }]);
    }
    setLoading(false);
  }

  return (
    <Panel eyebrow="MODULE 01 / CHAT" title={`OPERATOR CHAT · ${activeModel === "openai" ? "OPENAI" : "CLAUDE"} · ${aiStatus}`}>
      <div style={{
        height: 200, overflowY: "auto", marginBottom: 12,
        background: "#080808", borderRadius: 4, padding: "10px 12px",
        border: "0.5px solid #1a1a1a"
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <span style={{
              fontSize: 9, color: m.role === "user" ? "#c0392b" : m.role === "system" ? "#555" : "#666",
              fontFamily: "'Share Tech Mono', monospace", marginRight: 6
            }}>
              {m.role === "user" ? "CHIEF>" : m.role === "system" ? "SYS>" : "ULTRON>"}
            </span>
            <span style={{ fontSize: 12, color: m.role === "user" ? "#eee" : "#999", lineHeight: 1.5 }}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: 12, color: "#c0392b", fontFamily: "'Share Tech Mono', monospace" }}>
            ULTRON&gt; <span style={{ animation: "blink 1s infinite" }}>▋</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Message ULTRON, /model claude, /model openai, /clear..."
          style={{
            flex: 1, background: "#111", border: "0.5px solid #333",
            borderRadius: 4, padding: "10px 12px", color: "#eee",
            fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
            outline: "none", minHeight: 44
          }}
        />
        <button
          onClick={send}
          style={{
            background: "#c0392b", border: "none", borderRadius: 4,
            color: "#fff", fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12, padding: "10px 16px", cursor: "pointer",
            minWidth: 60, minHeight: 44
          }}
        >
          SEND
        </button>
      </div>
    </Panel>
  );
}

function VoicePanel() {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "es-MX";
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
    };
    rec.onend = () => setStatus("idle");
    rec.onerror = () => setStatus("error");
    recognitionRef.current = rec;
  }, []);

  function startVoice() {
    if (!supported || !recognitionRef.current) return;
    setTranscript("");
    setStatus("listening");
    recognitionRef.current.start();
  }

  function stopVoice() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setStatus("idle");
  }

  return (
    <Panel eyebrow="MODULE 02 / VOICE" title="VOICE INPUT">
      {!supported ? (
        <div style={{ fontSize: 12, color: "#666", fontFamily: "'Share Tech Mono', monospace" }}>
          Web Speech API not supported in this browser.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              onClick={startVoice}
              disabled={status === "listening"}
              style={{
                flex: 1, minHeight: 44, background: status === "listening" ? "#1a0a0a" : "#c0392b",
                border: `0.5px solid ${status === "listening" ? "#5a1010" : "#c0392b"}`,
                borderRadius: 4, color: "#fff",
                fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
                cursor: status === "listening" ? "not-allowed" : "pointer"
              }}
            >
              {status === "listening" ? "● LISTENING..." : "▶ START VOICE"}
            </button>
            <button
              onClick={stopVoice}
              style={{
                minHeight: 44, background: "#111", border: "0.5px solid #333",
                borderRadius: 4, color: "#888",
                fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
                padding: "0 16px", cursor: "pointer"
              }}
            >
              ■ STOP
            </button>
          </div>
          <div style={{
            background: "#080808", borderRadius: 4, padding: "10px 12px",
            minHeight: 40, fontSize: 12, color: transcript ? "#eee" : "#444",
            fontFamily: "'Share Tech Mono', monospace", border: "0.5px solid #1a1a1a"
          }}>
            {transcript || "Transcript appears here..."}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "#555", fontFamily: "'Share Tech Mono', monospace" }}>
            ENGINE: Web Speech API (es-MX) — ElevenLabs: BLOCKED_UNTIL_V1_3
          </div>
        </>
      )}
    </Panel>
  );
}

function CommandPanel({ backendOnline }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function dryRun(command) {
    setSelected(command);
    setResult(null);
    setLoading(true);
    try {
      if (backendOnline) {
        const res = await authFetch("/api/execute", {
          method: "POST",
          body: JSON.stringify({ command, approved: true })
        });
        const data = await res.json();
        setResult(data);
      } else {
        setResult({ ok: true, execution: "DRY_RUN", message: "Backend offline — local simulation only." });
      }
    } catch {
      setResult({ ok: false, reason: "Backend offline." });
    }
    setLoading(false);
  }

  return (
    <Panel eyebrow="MODULE 03 / COMMANDS" title="COMMAND CONSOLE">
      <div style={{ marginBottom: 10 }}>
        {COMMAND_ALLOWLIST.map((cmd) => (
          <button
            key={cmd}
            onClick={() => dryRun(cmd)}
            style={{
              display: "block", width: "100%", textAlign: "left",
              background: selected === cmd ? "#1a0a0a" : "#111",
              border: `0.5px solid ${selected === cmd ? "#c0392b" : "#2a2a2a"}`,
              borderRadius: 4, padding: "10px 12px", marginBottom: 6,
              color: selected === cmd ? "#e74c3c" : "#888",
              fontFamily: "'Share Tech Mono', monospace", fontSize: 11,
              cursor: "pointer", minHeight: 44
            }}
          >
            $ {cmd}
          </button>
        ))}
      </div>
      {loading && (
        <div style={{ fontSize: 11, color: "#c0392b", fontFamily: "'Share Tech Mono', monospace" }}>
          Validating...
        </div>
      )}
      {result && (
        <div style={{
          background: "#080808", borderRadius: 4, padding: "10px 12px",
          border: `0.5px solid ${result.ok ? "#1a4a1a" : "#5a1010"}`
        }}>
          <div style={{ fontSize: 10, color: result.ok ? "#27ae60" : "#e74c3c", fontFamily: "'Share Tech Mono', monospace", marginBottom: 4 }}>
            {result.ok ? "✓ VALIDATED" : "✗ BLOCKED"}
          </div>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "'Share Tech Mono', monospace" }}>
            {result.message || result.reason || ""}
          </div>
        </div>
      )}
    </Panel>
  );
}

function TaskQueue() {
  const STATUS_COLORS = {
    DRAFT: "gray", PENDING_APPROVAL: "amber",
    APPROVED: "green", DRY_RUN_EXECUTED: "green", BLOCKED: "red"
  };
  const [tasks, setTasks] = useState([
    { id: "T001", title: "Review git status", status: "DRAFT" },
    { id: "T002", title: "Run build check", status: "PENDING_APPROVAL" },
    { id: "T003", title: "Scan project files", status: "APPROVED" }
  ]);
  const [input, setInput] = useState("");

  function addTask() {
    const t = input.trim();
    if (!t) return;
    setTasks(prev => [...prev, {
      id: `T${String(Date.now()).slice(-4)}`,
      title: t, status: "DRAFT"
    }]);
    setInput("");
  }

  function nextStatus(status) {
    const flow = { DRAFT: "PENDING_APPROVAL", PENDING_APPROVAL: "APPROVED", APPROVED: "DRY_RUN_EXECUTED", DRY_RUN_EXECUTED: "DRAFT", BLOCKED: "DRAFT" };
    return flow[status] || "DRAFT";
  }

  return (
    <Panel eyebrow="MODULE 04 / TASKS" title="TASK QUEUE">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()}
          placeholder="New task..."
          style={{
            flex: 1, background: "#111", border: "0.5px solid #333",
            borderRadius: 4, padding: "10px 12px", color: "#eee",
            fontFamily: "'Share Tech Mono', monospace", fontSize: 11,
            outline: "none", minHeight: 44
          }}
        />
        <button onClick={addTask} style={{
          background: "#1a0a0a", border: "0.5px solid #c0392b",
          borderRadius: 4, color: "#c0392b", cursor: "pointer",
          fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
          padding: "0 14px", minHeight: 44
        }}>+</button>
      </div>
      {tasks.map(task => (
        <div key={task.id} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#111", borderRadius: 4, padding: "10px 12px",
          marginBottom: 6, border: "0.5px solid #1a1a1a", gap: 8
        }}>
          <div>
            <div style={{ fontSize: 10, color: "#555", fontFamily: "'Share Tech Mono', monospace" }}>{task.id}</div>
            <div style={{ fontSize: 12, color: "#ccc" }}>{task.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <Badge color={STATUS_COLORS[task.status] || "gray"}>{task.status}</Badge>
            <button
              onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus(t.status) } : t))}
              style={{
                background: "transparent", border: "0.5px solid #333",
                borderRadius: 3, color: "#666", cursor: "pointer",
                fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
                padding: "4px 8px", minHeight: 32
              }}
            >▶</button>
            <button
              onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "BLOCKED" } : t))}
              style={{
                background: "transparent", border: "0.5px solid #5a1010",
                borderRadius: 3, color: "#c0392b", cursor: "pointer",
                fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
                padding: "4px 8px", minHeight: 32
              }}
            >✗</button>
          </div>
        </div>
      ))}
    </Panel>
  );
}

function SecurityPanel({ aiStatus, aiProvider }) {
  const aiReady = aiStatus !== "WAITING_FOR_KEY";
  const items = [
    { label: "External network", value: aiReady ? "CONTROLLED" : "OFF", ok: true },
    { label: "Secrets access", value: "OFF", ok: true },
    { label: ".env access", value: "OFF", ok: true },
    { label: "Git push", value: "OFF", ok: true },
    { label: "Real shell execution", value: "OFF", ok: true },
    { label: "Human approval", value: "ON", ok: true },
    { label: "AI provider", value: aiProvider.toUpperCase(), ok: true },
    { label: "AI proxy", value: aiStatus, ok: aiReady },
    { label: "ElevenLabs", value: "BLOCKED", ok: false }
  ];
  return (
    <Panel eyebrow="MODULE 05 / SECURITY" title="GUARDRAILS">
      {items.map(item => (
        <div key={item.label} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 0", borderBottom: "0.5px solid #1a1a1a"
        }}>
          <span style={{ fontSize: 12, color: "#777", fontFamily: "'Share Tech Mono', monospace" }}>
            {item.label}
          </span>
          <Badge color={item.value === "ON" ? "green" : item.value === "OFF" ? "green" : "gray"}>
            {item.value}
          </Badge>
        </div>
      ))}
    </Panel>
  );
}

function MemoryPanel({ backendOnline }) {
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(null);

  async function readFile(file) {
    setLoading(file);
    try {
      if (backendOnline) {
        const res = await authFetch(`/api/memory/${file}`);
        const data = await res.json();
        setContents(prev => ({ ...prev, [file]: data.content || data.reason || "No content." }));
      } else {
        setContents(prev => ({ ...prev, [file]: "Backend offline." }));
      }
    } catch {
      setContents(prev => ({ ...prev, [file]: "Backend offline." }));
    }
    setLoading(null);
  }

  return (
    <Panel eyebrow="MODULE 06 / MEMORY" title="MEMORY READ">
      {MEMORY_FILES.map(file => (
        <div key={file} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#888", fontFamily: "'Share Tech Mono', monospace" }}>{file}</span>
            <button
              onClick={() => readFile(file)}
              style={{
                background: "#111", border: "0.5px solid #333", borderRadius: 3,
                color: "#888", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10, padding: "4px 10px", minHeight: 32
              }}
            >
              {loading === file ? "..." : "READ"}
            </button>
          </div>
          {contents[file] && (
            <pre style={{
              background: "#080808", borderRadius: 4, padding: "8px 10px",
              fontSize: 10, color: "#666", fontFamily: "'Share Tech Mono', monospace",
              margin: 0, overflowX: "auto", maxHeight: 120,
              border: "0.5px solid #1a1a1a", whiteSpace: "pre-wrap", wordBreak: "break-word"
            }}>
              {contents[file].slice(0, 500)}{contents[file].length > 500 ? "\n[truncated...]" : ""}
            </pre>
          )}
        </div>
      ))}
    </Panel>
  );
}

export default function UltronMobile() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeModel, setActiveModel] = useState("");
  const aiProvider = backendHealth?.aiProvider || activeModel;
  const selectedProvider = activeModel || aiProvider || "claude";
  const aiProxy = backendHealth?.aiProxy || "WAITING_FOR_KEY";
  const aiStatus = aiProxy === "READY_WITH_KEY"
    ? `${aiProvider.toUpperCase()} READY`
    : "WAITING_FOR_KEY";

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      setBackendOnline(res.ok);
      setBackendHealth(res.ok ? data : null);
    } catch {
      setBackendOnline(false);
      setBackendHealth(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#eee",
      fontFamily: "'Rajdhani', 'Share Tech Mono', monospace"
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c0392b; border-radius: 2px; }
        input::placeholder { color: #444; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Header */}
      <header style={{
        background: "#0d0d0d", borderBottom: "0.5px solid #1a1a1a",
        padding: "12px 16px", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#c0392b", letterSpacing: "0.12em" }}>ULTRON</div>
            <Badge color="gray">v1.5</Badge>
            <Badge color="amber">SUPERVISED AUTONOMY</Badge>
            <Badge color={backendOnline ? "green" : "gray"}>{backendOnline ? "BACKEND ONLINE" : "BACKEND OFFLINE"}</Badge>
            <Badge color={aiProxy === "READY_WITH_KEY" ? "green" : "amber"}>{aiStatus}</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusDot on={backendOnline} />
            <span style={{ fontSize: 10, color: checking ? "#666" : backendOnline ? "#c0392b" : "#555", fontFamily: "'Share Tech Mono', monospace" }}>
              {checking ? "CHECKING..." : backendOnline ? "BACKEND ONLINE" : "BACKEND OFFLINE"}
            </span>
            <button
              onClick={checkHealth}
              style={{
                background: "transparent", border: "0.5px solid #333",
                borderRadius: 3, color: "#555", cursor: "pointer",
                fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
                padding: "3px 8px"
              }}
            >↻</button>
          </div>
        </div>
      </header>

      {/* Backend offline notice */}
      {!checking && !backendOnline && (
        <div style={{
          background: "#1a0a0a", borderBottom: "0.5px solid #5a1010",
          padding: "10px 16px", textAlign: "center"
        }}>
          <span style={{ fontSize: 11, color: "#e74c3c", fontFamily: "'Share Tech Mono', monospace" }}>
            Backend offline — run: <code style={{ background: "#2a0a0a", padding: "2px 6px", borderRadius: 3 }}>cd app && npm run backend</code>
          </span>
        </div>
      )}

      {/* Main layout — responsive */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        {/* Mobile: columna única / PC: dos columnas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 16,
          alignItems: "start"
        }}>
          {/* Columna izquierda: chat, voz, comandos */}
          <div>
            <ChatPanel backendOnline={backendOnline} aiStatus={aiStatus} activeModel={selectedProvider} setActiveModel={setActiveModel} />
            <VoicePanel />
            <CommandPanel backendOnline={backendOnline} />
          </div>

          {/* Columna derecha: tareas, seguridad, memoria */}
          <div>
            <TaskQueue />
            <SecurityPanel aiStatus={aiStatus} aiProvider={aiProvider} />
            <MemoryPanel backendOnline={backendOnline} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 20, padding: "14px 16px",
          background: "#0d0d0d", border: "0.5px solid #1a1a1a",
          borderRadius: 6, display: "flex",
          justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 8
        }}>
          <span style={{ fontSize: 10, color: "#c0392b", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.08em" }}>
            ULTRON v1.5 VERCEL SECURE ENVIRONMENT
          </span>
          <span style={{ fontSize: 10, color: "#444", fontFamily: "'Share Tech Mono', monospace" }}>
            NEXT → Mobile live AI validation after Vercel env is set
          </span>
        </div>
      </main>
    </div>
  );
}
