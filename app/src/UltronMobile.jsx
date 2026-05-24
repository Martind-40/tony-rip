import { useCallback, useEffect, useRef, useState } from "react";

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

const VOICE_TIERS = {
  cotidiano: "Web Speech API",
  importante: "kokoro-js prepared",
  clave: "ElevenLabs blocked max 10/day"
};

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

function Badge({ children, tone = "gray" }) {
  return <span className={`ultronBadge ${tone}`}>{children}</span>;
}

function Panel({ title, eyebrow, children }) {
  return (
    <section className="ultronPanel">
      {eyebrow && <div className="panelEyebrow">{eyebrow}</div>}
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

function ChatPanel({ backendOnline, aiProvider, aiStatus }) {
  const [messages, setMessages] = useState([
    { role: "system", text: "ULTRON Bloque 1 online. Router levels 0-3 active; supervised autonomy only." }
  ]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState(aiProvider || "openai");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => setProvider(aiProvider || "openai"), [aiProvider]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    if (text.toLowerCase() === "/clear") {
      setMessages([{ role: "system", text: "Chat cleared. Guardrails remain active." }]);
      setInput("");
      return;
    }

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      if (!backendOnline) throw new Error("offline");
      const res = await authFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, provider, approvedBy: "chief_ui" })
      });
      const data = await res.json();
      const label = data.routerLevel !== undefined ? `L${data.routerLevel} ${data.model}` : data.model || provider;
      const response = data.status === "WAITING_FOR_KEY"
        ? `${data.provider?.toUpperCase() || provider.toUpperCase()} waiting for secure key.`
        : data.message || data.reason || "No response.";
      setMessages(prev => [...prev, { role: "ultron", text: `[${label}] ${response}` }]);
    } catch {
      setMessages(prev => [...prev, { role: "ultron", text: "Backend offline. Start backend with: npm run backend" }]);
    }
    setLoading(false);
  }

  return (
    <Panel eyebrow="MODULE 01 / CHAT" title={`Operator Chat · ${aiStatus}`}>
      <div className="providerBar">
        {["openai", "claude"].map(item => (
          <button key={item} className={provider === item ? "active" : ""} onClick={() => setProvider(item)}>
            {item.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="chatStream">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`chatLine ${message.role}`}>
            <span>{message.role === "user" ? "CHIEF>" : message.role === "system" ? "SYS>" : "ULTRON>"}</span>
            <p>{message.text}</p>
          </div>
        ))}
        {loading && <div className="chatLine ultron"><span>ULTRON&gt;</span><p>...</p></div>}
        <div ref={bottomRef} />
      </div>
      <div className="inputRow">
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => event.key === "Enter" && !event.shiftKey && send()}
          placeholder="Message ULTRON, ask status, privacy, batch, or strong analysis..."
        />
        <button onClick={send}>SEND</button>
      </div>
    </Panel>
  );
}

function VoicePanel() {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [mode, setMode] = useState("cotidiano");
  const [logs, setLogs] = useState([]);
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
    rec.onresult = event => {
      const text = Array.from(event.results).map(result => result[0].transcript).join("");
      setTranscript(text);
    };
    rec.onend = () => setStatus("idle");
    rec.onerror = () => setStatus("error");
    recognitionRef.current = rec;
  }, []);

  function distilledLog(text) {
    const clean = text.trim().slice(0, 180);
    if (!clean) return;
    setLogs(prev => [{ id: Date.now(), mode, text: clean }, ...prev].slice(0, 4));
  }

  function startVoice() {
    if (!supported || !recognitionRef.current) return;
    setTranscript("");
    setStatus("listening");
    recognitionRef.current.start();
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setStatus("idle");
    distilledLog(transcript);
  }

  function speak() {
    const text = transcript.trim() || "ULTRON voice layer online. Supervised autonomy remains active.";
    distilledLog(text);
    if (mode !== "cotidiano" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <Panel eyebrow="MODULE 02 / VOICE" title="Voice Layer">
      <div className="voiceModeBar">
        {Object.keys(VOICE_TIERS).map(item => (
          <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="buttonGrid">
        <button disabled={!supported || status === "listening"} onClick={startVoice}>
          {status === "listening" ? "LISTENING..." : "START VOICE"}
        </button>
        <button onClick={stopVoice}>STOP</button>
        <button onClick={speak}>SPEAK</button>
      </div>
      <div className="transcriptBox">{transcript || "Transcript appears here..."}</div>
      <div className="microcopy">Engine: {VOICE_TIERS[mode]}. ElevenLabs real remains blocked until key and approval.</div>
      <div className="voiceLog">
        {logs.length === 0 ? "Distilled voice log appears here." : logs.map(log => (
          <div key={log.id}>[{log.mode}] {log.text}</div>
        ))}
      </div>
    </Panel>
  );
}

function CommandPanel({ backendOnline }) {
  const [result, setResult] = useState(null);

  async function dryRun(command) {
    try {
      if (!backendOnline) {
        setResult({ ok: true, message: "Backend offline. Local UI simulation only." });
        return;
      }
      const res = await authFetch("/api/execute", {
        method: "POST",
        body: JSON.stringify({ command, approved: true })
      });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, reason: "Backend offline." });
    }
  }

  return (
    <Panel eyebrow="MODULE 03 / COMMANDS" title="Command Console">
      <div className="commandGrid">
        {COMMAND_ALLOWLIST.map(command => (
          <button key={command} onClick={() => dryRun(command)}>$ {command}</button>
        ))}
      </div>
      {result && <div className={result.ok ? "resultBox ok" : "resultBox blocked"}>{result.message || result.reason}</div>}
    </Panel>
  );
}

function TaskQueue() {
  const [tasks, setTasks] = useState([
    { id: "T001", title: "Validate PWA manifest", status: "READY" },
    { id: "T002", title: "Voice layer browser test", status: "READY" },
    { id: "T003", title: "Router budget check", status: "READY" }
  ]);
  const [input, setInput] = useState("");

  function addTask() {
    const title = input.trim();
    if (!title) return;
    setTasks(prev => [...prev, { id: `T${String(Date.now()).slice(-4)}`, title, status: "DRAFT" }]);
    setInput("");
  }

  return (
    <Panel eyebrow="MODULE 04 / TASKS" title="Session Tasks">
      <div className="inputRow">
        <input value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => event.key === "Enter" && addTask()} placeholder="New session task..." />
        <button onClick={addTask}>ADD</button>
      </div>
      <div className="taskList">
        {tasks.map(task => <div key={task.id}><span>{task.id}</span><p>{task.title}</p><Badge tone="amber">{task.status}</Badge></div>)}
      </div>
    </Panel>
  );
}

function RouterPanel({ router }) {
  return (
    <Panel eyebrow="MODULE 05 / AI ROUTER" title="Provider Router">
      <div className="routerGrid">
        <div><strong>N0</strong><span>Rules local</span></div>
        <div><strong>N1</strong><span>Ollama private</span></div>
        <div><strong>N2</strong><span>Gemini Flash</span></div>
        <div><strong>N3</strong><span>gpt-4o-mini</span></div>
      </div>
      <div className="routerBudget">
        Calls today: {router?.consumption?.callsToday ?? 0} / {router?.limits?.maxCallsPerDay ?? 50}
      </div>
    </Panel>
  );
}

function SecurityPanel({ aiStatus }) {
  const items = [
    ["External network", aiStatus === "WAITING_FOR_KEY" ? "OFF" : "CONTROLLED"],
    ["Secrets access", "OFF"],
    [".env access", "OFF"],
    ["Git push", "OFF"],
    ["Real shell execution", "OFF"],
    ["Human approval", "ON"],
    ["ElevenLabs", "BLOCKED"]
  ];
  return (
    <Panel eyebrow="MODULE 06 / SECURITY" title="Guardrails">
      <div className="guardrailList">
        {items.map(([label, value]) => <div key={label}><span>{label}</span><Badge tone={value === "OFF" || value === "ON" ? "green" : "gray"}>{value}</Badge></div>)}
      </div>
    </Panel>
  );
}

function MemoryPanel({ backendOnline }) {
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState("");

  async function readFile(file) {
    setLoading(file);
    try {
      if (!backendOnline) throw new Error("offline");
      const res = await authFetch(`/api/memory/${file}`);
      const data = await res.json();
      setContents(prev => ({ ...prev, [file]: data.content || data.reason || "No content." }));
    } catch {
      setContents(prev => ({ ...prev, [file]: "Backend offline." }));
    }
    setLoading("");
  }

  return (
    <Panel eyebrow="MODULE 07 / MEMORY" title="Memory Panel">
      <div className="memoryTierList">
        <div>Level 0: current session state</div>
        <div>Level 1: runtime logs and JSON</div>
        <div>Level 2: distilled knowledge next block</div>
        <div>Level 3: ecosystem memory blocked</div>
      </div>
      {MEMORY_FILES.map(file => (
        <div className="memoryFile" key={file}>
          <button onClick={() => readFile(file)}>{loading === file ? "..." : "READ"}</button>
          <span>{file}</span>
          {contents[file] && <pre>{contents[file].slice(0, 420)}{contents[file].length > 420 ? "\n[truncated]" : ""}</pre>}
        </div>
      ))}
    </Panel>
  );
}

export default function UltronMobile() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [health, setHealth] = useState(null);

  const aiProvider = health?.aiProvider || "openai";
  const aiProxy = health?.aiProxy || "WAITING_FOR_KEY";
  const aiStatus = aiProxy === "READY_WITH_KEY" ? `${aiProvider.toUpperCase()} READY` : "WAITING_FOR_KEY";

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      setBackendOnline(res.ok);
      setHealth(res.ok ? data : null);
    } catch {
      setBackendOnline(false);
      setHealth(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div className="ultronMobile">
      <header className="mobileHeader">
        <div className="brandCluster">
          <div className="brandMark">ULTRON</div>
          <Badge>BLOQUE 1</Badge>
          <Badge tone="amber">SUPERVISED AUTONOMY</Badge>
          <Badge tone={backendOnline ? "green" : "gray"}>{backendOnline ? "BACKEND ONLINE" : "BACKEND OFFLINE"}</Badge>
          <Badge tone={aiProxy === "READY_WITH_KEY" ? "green" : "amber"}>{aiStatus}</Badge>
          <Badge tone="green">PWA READY</Badge>
        </div>
        <button className="refreshButton" onClick={checkHealth}>{checking ? "..." : "REFRESH"}</button>
      </header>

      {!checking && !backendOnline && <div className="offlineNotice">Backend offline. Run: cd app && npm run backend</div>}

      <main className="mobileGrid">
        <div>
          <ChatPanel backendOnline={backendOnline} aiProvider={aiProvider} aiStatus={aiStatus} />
          <VoicePanel />
          <CommandPanel backendOnline={backendOnline} />
        </div>
        <div>
          <TaskQueue />
          <RouterPanel router={health?.router} />
          <SecurityPanel aiStatus={aiStatus} />
          <MemoryPanel backendOnline={backendOnline} />
        </div>
      </main>

      <footer className="mobileFooter">
        <span>ULTRON BLOQUE 1 CLOSED · v1.6 Voice · v1.7 PWA · v1.8 Router</span>
        <span>NEXT → ULTRON Bloque 2 — AETHERNOVA Workspace</span>
      </footer>
    </div>
  );
}
