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

const ALLOWED_ACTIONS = [
  { id: "summarize_meeting", label: "Summarize Meeting", risk: "LOW" },
  { id: "distill_knowledge", label: "Distill Knowledge", risk: "LOW" },
  { id: "create_report", label: "Create Report", risk: "LOW" },
  { id: "read_workspace_file", label: "Read Workspace File", risk: "LOW" },
  { id: "add_task", label: "Add Task", risk: "LOW" }
];

const BLOCKED_ACTIONS = [
  "shell_exec", "git_push", "delete_file", "send_email", "access_credentials"
];

const STATUS_FLOW = {
  DRAFT: "PENDING_APPROVAL",
  PENDING_APPROVAL: "APPROVED",
  APPROVED: "EXECUTING",
  EXECUTING: "DONE",
  DONE: "DRAFT",
  BLOCKED: "DRAFT"
};

const STATUS_COLOR = {
  DRAFT: "gray", PENDING_APPROVAL: "amber",
  APPROVED: "green", EXECUTING: "red",
  DONE: "green", BLOCKED: "red"
};

const AGENT_TYPES = [
  { id: "meeting_agent", label: "Meeting Agent", icon: "🎙" },
  { id: "knowledge_agent", label: "Knowledge Agent", icon: "⚗" },
  { id: "task_agent", label: "Task Agent", icon: "✅" },
  { id: "report_agent", label: "Report Agent", icon: "📄" }
];

const INITIAL_AGENTS = [
  { id: "AGT-001", name: "Meeting Summarizer", type: "meeting_agent", task: "Process today's meeting notes and extract tasks", action: "summarize_meeting", status: "DRAFT", risk: "LOW", requires_approval: true, created: new Date().toISOString().split("T")[0] },
  { id: "AGT-002", name: "Knowledge Distiller", type: "knowledge_agent", task: "Distill workspace learnings into knowledge layer", action: "distill_knowledge", status: "PENDING_APPROVAL", risk: "LOW", requires_approval: true, created: new Date().toISOString().split("T")[0] },
  { id: "AGT-003", name: "Daily Report", type: "report_agent", task: "Generate daily operator summary report", action: "create_report", status: "APPROVED", risk: "LOW", requires_approval: true, created: new Date().toISOString().split("T")[0] }
];

export default function AgentsPanel({ backendOnline }) {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", type: "meeting_agent", task: "", action: "summarize_meeting", risk: "LOW" });
  const [executingId, setExecutingId] = useState(null);
  const [results, setResults] = useState({});

  const pending = agents.filter(a => a.status === "PENDING_APPROVAL").length;
  const approved = agents.filter(a => a.status === "APPROVED").length;

  function createAgent() {
    if (!newAgent.name.trim() || !newAgent.task.trim()) return;
    const agent = {
      id: `AGT-${String(Date.now()).slice(-4)}`,
      ...newAgent,
      status: "DRAFT",
      requires_approval: true,
      created: new Date().toISOString().split("T")[0]
    };
    setAgents(prev => [agent, ...prev]);
    setNewAgent({ name: "", type: "meeting_agent", task: "", action: "summarize_meeting", risk: "LOW" });
    setShowCreate(false);
  }

  function advance(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: STATUS_FLOW[a.status] || "DRAFT" } : a));
  }

  function block(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: "BLOCKED" } : a));
  }

  async function execute(agent) {
    if (agent.status !== "APPROVED") return;
    setExecutingId(agent.id);
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: "EXECUTING" } : a));

    try {
      let result = "";
      if (backendOnline) {
        const prompt = `You are ULTRON agent: ${agent.name}. Task: ${agent.task}. Action: ${agent.action}. Execute in supervised mode. Respond with a brief execution report (2-3 sentences).`;
        const res = await authFetch("/api/chat", { method: "POST", body: JSON.stringify({ message: prompt }) });
        const data = await res.json();
        result = data.ok ? data.message : `Simulated: ${agent.action} completed for "${agent.task}"`;
      } else {
        await new Promise(r => setTimeout(r, 1000));
        result = `[DRY_RUN] ${agent.action} executed for: "${agent.task}". No real action performed.`;
      }
      setResults(prev => ({ ...prev, [agent.id]: result }));
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: "DONE" } : a));
    } catch {
      setResults(prev => ({ ...prev, [agent.id]: "Execution failed — backend offline." }));
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: "BLOCKED" } : a));
    }
    setExecutingId(null);
  }

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 11 / SUPERVISED AGENTS</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.red, fontWeight: 600, fontFamily: C.fontMono }}>AGENT QUEUE</div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 9, color: C.amber, fontFamily: C.fontMono, background: "#1f1500", padding: "2px 7px", borderRadius: 3 }}>{pending} PENDING</span>
          <span style={{ fontSize: 9, color: C.green, fontFamily: C.fontMono, background: "#0a1f0a", padding: "2px 7px", borderRadius: 3 }}>{approved} APPROVED</span>
        </div>
      </div>

      {/* Allowed vs blocked */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: C.bg2, borderRadius: 4, padding: "8px 10px", border: `0.5px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.green, fontFamily: C.fontMono, marginBottom: 6 }}>ALLOWED ACTIONS</div>
          {ALLOWED_ACTIONS.map(a => <div key={a.id} style={{ fontSize: 9, color: "#666", fontFamily: C.fontMono, padding: "2px 0" }}>✓ {a.label}</div>)}
        </div>
        <div style={{ background: C.bg2, borderRadius: 4, padding: "8px 10px", border: `0.5px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.red, fontFamily: C.fontMono, marginBottom: 6 }}>BLOCKED ACTIONS</div>
          {BLOCKED_ACTIONS.map(a => <div key={a} style={{ fontSize: 9, color: "#666", fontFamily: C.fontMono, padding: "2px 0" }}>✗ {a}</div>)}
        </div>
      </div>

      {/* Create agent */}
      <button onClick={() => setShowCreate(!showCreate)} style={{ width: "100%", background: showCreate ? C.redGlow : "transparent", border: `0.5px solid ${C.border2}`, borderRadius: 4, color: C.textDim, fontFamily: C.fontMono, fontSize: 10, padding: "8px", cursor: "pointer", marginBottom: 10 }}>
        {showCreate ? "✕ CANCEL" : "+ CREATE AGENT"}
      </button>

      {showCreate && (
        <div style={{ background: C.bg2, borderRadius: 4, padding: "12px", border: `0.5px solid ${C.border2}`, marginBottom: 10 }}>
          <input value={newAgent.name} onChange={e => setNewAgent(p => ({ ...p, name: e.target.value }))} placeholder="Agent name..." style={{ width: "100%", background: C.bg3, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: "8px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", marginBottom: 6 }} />
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <select value={newAgent.type} onChange={e => setNewAgent(p => ({ ...p, type: e.target.value }))} style={{ flex: 1, background: C.bg3, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: "7px", color: C.textDim, fontFamily: C.fontMono, fontSize: 10, outline: "none" }}>
              {AGENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
            </select>
            <select value={newAgent.action} onChange={e => setNewAgent(p => ({ ...p, action: e.target.value }))} style={{ flex: 1, background: C.bg3, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: "7px", color: C.textDim, fontFamily: C.fontMono, fontSize: 10, outline: "none" }}>
              {ALLOWED_ACTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <textarea value={newAgent.task} onChange={e => setNewAgent(p => ({ ...p, task: e.target.value }))} placeholder="Task description..." style={{ width: "100%", background: C.bg3, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: "8px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", minHeight: 60, resize: "vertical", marginBottom: 6 }} />
          <button onClick={createAgent} style={{ width: "100%", background: C.red, border: "none", borderRadius: 4, color: "#fff", fontFamily: C.fontMono, fontSize: 11, padding: "9px", cursor: "pointer" }}>CREATE AGENT</button>
        </div>
      )}

      {/* Agent list */}
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {agents.map(agent => {
          const typeInfo = AGENT_TYPES.find(t => t.id === agent.type);
          const sc = STATUS_COLOR[agent.status] || "gray";
          const isExecuting = executingId === agent.id;
          return (
            <div key={agent.id} style={{ background: C.bg2, borderRadius: 4, padding: "10px 12px", marginBottom: 8, border: `0.5px solid ${agent.status === "PENDING_APPROVAL" ? "#4a3000" : agent.status === "APPROVED" ? "#1a4a1a" : C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{agent.id} · {typeInfo?.icon} {typeInfo?.label}</span>
                  <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{agent.name}</div>
                </div>
                <span style={{ fontSize: 9, fontFamily: C.fontMono, padding: "2px 6px", borderRadius: 3, background: { gray: "#141414", amber: "#1f1500", green: "#0a1f0a", red: "#1a0505" }[sc], color: { gray: C.textDim, amber: C.amber, green: C.green, red: C.red }[sc] }}>{agent.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "#777", fontFamily: C.fontMono, marginBottom: 6, lineHeight: 1.5 }}>{agent.task}</div>
              <div style={{ display: "flex", gap: 4, marginBottom: results[agent.id] ? 6 : 0, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono, background: C.bg3, padding: "2px 6px", borderRadius: 2 }}>⚡ {agent.action}</span>
                <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono, background: C.bg3, padding: "2px 6px", borderRadius: 2 }}>risk: {agent.risk}</span>
                <span style={{ fontSize: 9, color: C.red, fontFamily: C.fontMono, background: C.bg3, padding: "2px 6px", borderRadius: 2 }}>approval: REQUIRED</span>
              </div>
              {results[agent.id] && (
                <div style={{ background: C.bg3, borderRadius: 3, padding: "6px 8px", fontSize: 10, color: "#888", fontFamily: C.fontMono, marginBottom: 6, lineHeight: 1.5 }}>{results[agent.id]}</div>
              )}
              {agent.status !== "DONE" && agent.status !== "BLOCKED" && (
                <div style={{ display: "flex", gap: 6 }}>
                  {agent.status === "APPROVED" ? (
                    <button onClick={() => execute(agent)} disabled={isExecuting} style={{ flex: 1, background: isExecuting ? C.redGlow : "#0a1f0a", border: `0.5px solid ${C.green}`, borderRadius: 3, color: C.green, fontFamily: C.fontMono, fontSize: 10, padding: "6px", cursor: isExecuting ? "not-allowed" : "pointer" }}>
                      {isExecuting ? "EXECUTING..." : "▶ EXECUTE"}
                    </button>
                  ) : (
                    <button onClick={() => advance(agent.id)} style={{ flex: 1, background: "transparent", border: `0.5px solid ${C.border2}`, borderRadius: 3, color: C.textDim, fontFamily: C.fontMono, fontSize: 10, padding: "6px", cursor: "pointer" }}>
                      {agent.status === "DRAFT" ? "→ REQUEST APPROVAL" : agent.status === "PENDING_APPROVAL" ? "✓ APPROVE" : "▶ ADVANCE"}
                    </button>
                  )}
                  <button onClick={() => block(agent.id)} style={{ background: "#1a0505", border: `0.5px solid #5a1010`, borderRadius: 3, color: C.red, fontFamily: C.fontMono, fontSize: 10, padding: "6px 10px", cursor: "pointer" }}>✗</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
