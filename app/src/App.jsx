import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  tasks: "ultron.demo.tasks",
  knowledge: "ultron.demo.knowledge",
  approvals: "ultron.demo.approvals",
  operatorActions: "ultron.demo.operatorActions"
};

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`.toUpperCase();
}

function loadDemoState(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveDemoState(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo storage is best-effort only.
  }
}

const commandCards = [
  {
    title: "Public Demo Mode",
    status: "Safe",
    priority: "P0",
    body: "Uses generic sample content only. No private documents, credentials, or company data."
  },
  {
    title: "Memory Layer",
    status: "Manual",
    priority: "P1",
    body: "Markdown and JSON-ready workspace for notes, tasks, decisions, and learning logs."
  },
  {
    title: "Knowledge Router",
    status: "Prepared",
    priority: "P1",
    body: "Routes work by project context with clear boundaries before private mode is enabled."
  },
  {
    title: "Agent Factory",
    status: "Proposal",
    priority: "P2",
    body: "Defines future assistants and approval rules without creating autonomous agents yet."
  },
  {
    title: "Vercel Ready",
    status: "Buildable",
    priority: "P0",
    body: "Static Vite app prepared for deployment from the app directory with zero backend."
  }
];

const privateStatus = [
  { label: "Current state", value: "NOT_READY" },
  { label: "Mode", value: "DESIGN_ONLY" },
  { label: "Real data access", value: "BLOCKED" },
  { label: "Backend", value: "NOT_CONNECTED" },
  { label: "Authentication", value: "NOT_CONNECTED" }
];

const memoryStatus = [
  { label: "Status", value: "DESIGN_ONLY" },
  { label: "Real memory persistence", value: "BLOCKED" },
  { label: "Human review required", value: "YES" },
  { label: "Export/import", value: "MOCK_ONLY" }
];

const presentationStatus = [
  { label: "Public demo", value: "READY" },
  { label: "Presentation pack", value: "READY" },
  { label: "Private mode", value: "NOT_READY" },
  { label: "Manual memory", value: "DESIGN_ONLY" },
  { label: "Agents", value: "BLOCKED" },
  { label: "Real data", value: "NOT_CONNECTED" }
];

const architectureStatus = [
  { label: "Blueprint", value: "READY" },
  { label: "Private Mode", value: "NOT_READY" },
  { label: "Storage", value: "NOT_IMPLEMENTED" },
  { label: "Approval Gate", value: "DESIGNED" },
  { label: "Agent Execution", value: "BLOCKED" },
  { label: "Real Data", value: "NOT_CONNECTED" }
];

const localMemoryStatus = [
  { label: "Memory mode", value: "MOCK_ONLY" },
  { label: "Storage", value: "NOT_IMPLEMENTED" },
  { label: "Raw data", value: "NOT_STORED" },
  { label: "Approval", value: "HUMAN_REVIEW_REQUIRED" },
  { label: "Backend", value: "NOT_CONNECTED" },
  { label: "APIs", value: "NOT_CONNECTED" },
  { label: "Agents", value: "BLOCKED" }
];

const mockMemoryItems = [
  {
    item: "MEM-001",
    classification: "pure_knowledge",
    approval: "APPROVED_MOCK",
    storage: "MOCK_ONLY"
  },
  {
    item: "MEM-002",
    classification: "product_learning",
    approval: "STORED_AS_KNOWLEDGE_MOCK",
    storage: "MOCK_ONLY"
  },
  {
    item: "MEM-003",
    classification: "blocked_sensitive",
    approval: "BLOCKED_MOCK",
    storage: "NOT_STORED"
  }
];

const approvalQueueStatus = [
  { label: "Queue mode", value: "MOCK_ONLY" },
  { label: "Execution", value: "DISABLED" },
  { label: "Human approval", value: "REQUIRED" },
  { label: "Agents", value: "BLOCKED" },
  { label: "Real actions", value: "NOT_CONNECTED" },
  { label: "Audit", value: "MOCK_LOGGED" }
];

const controlledPrivateModeStatus = [
  { label: "Private Mode MVP", value: "MOCK_READY" },
  { label: "Memory", value: "MOCK_ONLY" },
  { label: "Approval Queue", value: "MOCK_ONLY" },
  { label: "Audit", value: "MOCK_ONLY" },
  { label: "Agents", value: "BLOCKED" },
  { label: "Execution", value: "DISABLED" },
  { label: "Backend/Auth/APIs", value: "NOT_CONNECTED" },
  { label: "Real Data", value: "NOT_CONNECTED" }
];

const mockApprovalRequests = [
  {
    request: "APR-001",
    type: "memory_write",
    risk: "medium",
    approval: "PENDING_REVIEW_MOCK",
    execution: "NOT_EXECUTED"
  },
  {
    request: "APR-002",
    type: "sensitive_data_intake",
    risk: "critical",
    approval: "BLOCKED_MOCK",
    execution: "DENIED"
  },
  {
    request: "APR-003",
    type: "agent_action",
    risk: "high",
    approval: "EXECUTION_DENIED_MOCK",
    execution: "DENIED"
  },
  {
    request: "APR-004",
    type: "public_demo_note",
    risk: "low",
    approval: "APPROVED_MOCK",
    execution: "MOCK_ONLY"
  }
];

const approvalGate = [
  "Every sensitive action requires approval",
  "No autonomous execution",
  "No background actions",
  "No external system control",
  "No private tool execution"
];

const futureComponents = [
  "Private workspace",
  "Manual memory inbox",
  "Knowledge distiller",
  "Approval queue",
  "Agent permissions panel",
  "Audit log mock",
  "Safe export system"
];

const criticalBoundaries = [
  "No company data",
  "No credentials",
  "No API keys",
  "No client documents",
  "No sensitive personal records",
  "No autonomous agents"
];

const mvpMatrix = [
  {
    component: "Private Mode UI",
    status: "PREPARED",
    risk: "Low",
    next: "Keep demo-safe"
  },
  {
    component: "Manual Memory Workflow",
    status: "DESIGN_ONLY",
    risk: "Medium",
    next: "Needs local/private storage later"
  },
  {
    component: "Agent Permissions",
    status: "DOCUMENTED",
    risk: "Medium",
    next: "Needs approval engine later"
  },
  {
    component: "Backend",
    status: "BLOCKED",
    risk: "High",
    next: "Not allowed in this sprint"
  },
  {
    component: "Auth",
    status: "BLOCKED",
    risk: "High",
    next: "Not allowed in this sprint"
  },
  {
    component: "Real Data Access",
    status: "BLOCKED",
    risk: "Critical",
    next: "Requires future private architecture"
  }
];

const realityMatrix = [
  {
    capability: "Command Center",
    current: "Visual demo ready",
    future: "Future operational hub"
  },
  {
    capability: "Private Mode",
    current: "Not ready",
    future: "Controlled private workspace"
  },
  {
    capability: "Manual Memory",
    current: "Design only",
    future: "Local/private memory with review"
  },
  {
    capability: "Agent Permissions",
    current: "Documented",
    future: "Approval-based execution control"
  },
  {
    capability: "Backend / Auth / APIs",
    current: "Not connected",
    future: "Approved private architecture"
  },
  {
    capability: "Agents",
    current: "Blocked",
    future: "Human-approved agents"
  }
];

const operatorSystemState = [
  { label: "Public Demo Mode", value: "ACTIVE" },
  { label: "Private Mode", value: "NOT_READY" },
  { label: "Operator Core", value: "MVP_READY" },
  { label: "Autonomous Agents", value: "BLOCKED" },
  { label: "Model Router", value: "PLACEHOLDER" },
  { label: "MCP Tools", value: "PLANNED" },
  { label: "Safe Terminal", value: "CONTROLLED" }
];

const safeCommands = [
  {
    name: "Check Project Status",
    status: "SAFE_MOCK",
    risk: "LOW",
    result:
      "Project status inspection prepared. Real terminal execution requires Private Mode."
  },
  {
    name: "View Last Build State",
    status: "SAFE_MOCK",
    risk: "LOW",
    result:
      "Last known build state is represented by local validation notes. No backend build runner is connected."
  },
  {
    name: "Review Git Status",
    status: "SAFE_MOCK",
    risk: "LOW",
    result:
      "Git status review is staged as a controlled read-only action. UI does not execute git commands."
  },
  {
    name: "Inspect Operator Logs",
    status: "SAFE",
    risk: "LOW",
    result:
      "Visible Action Log updated in browser state. Demo log contains no private data."
  },
  {
    name: "Prepare Model Router",
    status: "PLACEHOLDER_READY",
    risk: "LOW",
    result: "Model router strategy prepared. No API keys connected."
  },
  {
    name: "Review Safety Rules",
    status: "SAFE",
    risk: "LOW",
    result:
      "Safety policy visible. Sensitive data, autonomous agents and external execution remain blocked."
  }
];

const modelRouterRows = [
  { model: "Local/free model", status: "READY_FOR_DESIGN" },
  { model: "OpenAI", status: "AVAILABLE_LATER" },
  { model: "Claude", status: "AVAILABLE_LATER" },
  { model: "Gemini", status: "AVAILABLE_LATER" },
  { model: "Ollama/Qwen/Gemma", status: "FUTURE_LOCAL" },
  { model: "Routing policy", status: "COST_PRIVACY_QUALITY" }
];

const approvalPolicyRows = [
  "READ_ONLY",
  "SUGGEST_ONLY",
  "SAFE_EXECUTE",
  "APPROVAL_REQUIRED",
  "BLOCKED"
];

const absorptionRows = [
  { source: "Claurst", pattern: "terminal agent / MCP / ACP" },
  { source: "OpenHands", pattern: "sandbox / software agent" },
  { source: "Aider", pattern: "coding assistant / diffs" },
  { source: "LiteLLM", pattern: "model router" },
  { source: "MCP servers", pattern: "tooling connectors" }
];

function StatusList({ items }) {
  return (
    <div className="statusList">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState(() =>
    loadDemoState(STORAGE_KEYS.tasks, [])
  );
  const [noteInput, setNoteInput] = useState("");
  const [knowledgeItems, setKnowledgeItems] = useState(() =>
    loadDemoState(STORAGE_KEYS.knowledge, [])
  );
  const [approvalItems, setApprovalItems] = useState(() =>
    loadDemoState(STORAGE_KEYS.approvals, [])
  );
  const [operatorActions, setOperatorActions] = useState(() =>
    loadDemoState(STORAGE_KEYS.operatorActions, [])
  );
  const [lastOperatorResult, setLastOperatorResult] = useState(
    "No command selected yet."
  );

  useEffect(() => {
    saveDemoState(STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  useEffect(() => {
    saveDemoState(STORAGE_KEYS.knowledge, knowledgeItems);
  }, [knowledgeItems]);

  useEffect(() => {
    saveDemoState(STORAGE_KEYS.approvals, approvalItems);
  }, [approvalItems]);

  useEffect(() => {
    saveDemoState(STORAGE_KEYS.operatorActions, operatorActions);
  }, [operatorActions]);

  const taskCounts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "PENDING").length,
      doing: tasks.filter((task) => task.status === "DOING").length,
      done: tasks.filter((task) => task.status === "DONE").length
    }),
    [tasks]
  );

  const pendingApprovalCount = useMemo(
    () =>
      approvalItems.filter((item) => item.status === "PENDING_REVIEW_MOCK")
        .length,
    [approvalItems]
  );

  function addTask() {
    const title = taskInput.trim();
    if (!title) {
      return;
    }

    setTasks((current) => [
      { id: createId("TASK"), title, status: "PENDING" },
      ...current
    ]);
    setTaskInput("");
  }

  function updateTaskStatus(id, status) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task))
    );
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function distillNote() {
    const note = noteInput.trim();
    if (!note) {
      return;
    }

    setKnowledgeItems((current) => [
      {
        id: createId("KN"),
        preview: note.slice(0, 120),
        distilled: `Reusable lesson: ${note.slice(0, 160)}`,
        classification: "PURE_KNOWLEDGE_MOCK",
        status: "REVIEW_REQUIRED",
        sentToApproval: false
      },
      ...current
    ]);
    setNoteInput("");
  }

  function sendToApprovalQueue(item) {
    if (item.sentToApproval) {
      return;
    }

    const approvalId = createId("APR");
    setApprovalItems((current) => [
      {
        id: approvalId,
        sourceId: item.id,
        type: "knowledge_review",
        risk: "low",
        status: "PENDING_REVIEW_MOCK",
        action: "Review distilled demo knowledge"
      },
      ...current
    ]);
    setKnowledgeItems((current) =>
      current.map((record) =>
        record.id === item.id
          ? { ...record, sentToApproval: true, status: "PENDING_REVIEW_MOCK" }
          : record
      )
    );
  }

  function deleteKnowledgeItem(id) {
    setKnowledgeItems((current) => current.filter((item) => item.id !== id));
    setApprovalItems((current) =>
      current.filter((item) => item.sourceId !== id)
    );
  }

  function updateApprovalStatus(id, status) {
    setApprovalItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }

  function handleCommand(command) {
    const entry = {
      id: createId("OP"),
      action: command.name,
      status: command.status,
      timestamp: new Date().toLocaleString(),
      result: command.result,
      risk: command.risk
    };

    setLastOperatorResult(command.result);
    setOperatorActions((current) => [entry, ...current].slice(0, 12));
  }

  return (
    <main className="appShell">
      <header className="terminalBar" aria-label="Operator terminal header">
        <div>
          <span className="terminalDot" />
          <strong>ULTRON</strong>
          <small>Knowledge Operator</small>
        </div>
        <span className="terminalStatus">PUBLIC DEMO MODE</span>
      </header>

      <section className="heroCard" aria-labelledby="ultron-title">
        <p className="eyebrow">ULTRON / PUBLIC FOUNDATION</p>
        <h1 id="ultron-title">ULTRON Command Center</h1>
        <p className="heroText">
          A public demo command center for a future work assistant and
          knowledge operator.
        </p>
        <p className="safetyLine">
          Public demo only — no real data, backend, authentication, APIs,
          private memory, or autonomous agents are connected.
        </p>
        <div className="commandLine" aria-label="Current operator command">
          <span>$</span>
          <code>ultron status --mode public --autonomy manual</code>
        </div>
      </section>

      <section className="statusStrip" aria-label="System status">
        <div>
          <span>Mode</span>
          <strong>PUBLIC DEMO</strong>
        </div>
        <div>
          <span>Private Mode</span>
          <strong>NOT_READY</strong>
        </div>
        <div>
          <span>Agents</span>
          <strong>BLOCKED</strong>
        </div>
        <div>
          <span>Private Data</span>
          <strong>0</strong>
        </div>
        <div>
          <span>Backend</span>
          <strong>NOT_CONNECTED</strong>
        </div>
        <div>
          <span>Deploy Target</span>
          <strong>Vercel</strong>
        </div>
      </section>

      <section className="operatorCorePanel" aria-labelledby="operator-core">
        <div className="sectionIntro">
          <p className="eyebrow">FUNCTIONAL MVP / OPERATOR CORE</p>
          <h2 id="operator-core">ULTRON Operator Core</h2>
          <p>
            Controlled frontend operator core with safe command cards, action
            logging, model routing placeholder and permission visibility.
          </p>
        </div>
        <p className="safetyLine">
          Do not enter private, company, client, credential or sensitive data.
        </p>

        <div className="operatorCoreGrid">
          <article className="operatorCoreCard">
            <h3>System State</h3>
            <StatusList items={operatorSystemState} />
          </article>

          <article className="operatorCoreCard commandCenterCard">
            <h3>Safe Command Center</h3>
            <div className="safeCommandGrid">
              {safeCommands.map((command) => (
                <button
                  type="button"
                  key={command.name}
                  onClick={() => handleCommand(command)}
                >
                  <span>{command.name}</span>
                  <strong>{command.status}</strong>
                </button>
              ))}
            </div>
            <p className="operatorResult">{lastOperatorResult}</p>
          </article>

          <article className="operatorCoreCard actionLogCard">
            <div className="moduleHeader">
              <div>
                <span>Local visible record</span>
                <h3>Action Log</h3>
              </div>
              <strong>{operatorActions.length} entries</strong>
            </div>
            <div className="actionLogList">
              {operatorActions.length === 0 ? (
                <p className="emptyState">No operator actions yet.</p>
              ) : (
                operatorActions.map((entry) => (
                  <div className="actionLogEntry" key={entry.id}>
                    <strong>{entry.action}</strong>
                    <span>{entry.status}</span>
                    <span>{entry.timestamp}</span>
                    <p>{entry.result}</p>
                    <small>Risk: {entry.risk}</small>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="operatorCoreCard">
            <h3>Model Router Placeholder</h3>
            <div className="compactTable">
              {modelRouterRows.map((row) => (
                <div key={row.model}>
                  <span>{row.model}</span>
                  <strong>{row.status}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="operatorCoreCard">
            <h3>Human Approval Policy</h3>
            <div className="policyPills">
              {approvalPolicyRows.map((level) => (
                <span key={level}>{level}</span>
              ))}
            </div>
          </article>

          <article className="operatorCoreCard">
            <h3>Open Source Absorption</h3>
            <div className="compactTable">
              {absorptionRows.map((row) => (
                <div key={row.source}>
                  <span>{row.source}</span>
                  <strong>{row.pattern}</strong>
                </div>
              ))}
            </div>
            <p className="warningText">
              No real integration, destructive autonomy or connected
              credentials are active.
            </p>
          </article>
        </div>
      </section>

      <section
        className="actionableOperator"
        aria-labelledby="actionable-operator-title"
      >
        <div className="sectionIntro">
          <p className="eyebrow">SPRINT 16 / FUNCTIONAL FRONTEND</p>
          <h2 id="actionable-operator-title">Actionable Operator MVP</h2>
          <p>
            A demo-safe operator layer for tasks, reusable knowledge capture and
            mock approval decisions. Everything runs in the browser.
          </p>
        </div>
        <p className="safetyLine">
          Do not enter private, company, client, credential or sensitive data.
        </p>

        <div className="operatorModules">
          <article className="operatorModule" aria-labelledby="task-console">
            <div className="moduleHeader">
              <div>
                <span>Module 1</span>
                <h3 id="task-console">Task Console</h3>
              </div>
              <strong>{taskCounts.total} total</strong>
            </div>
            <div className="counterGrid" aria-label="Task counters">
              <span>Pending: {taskCounts.pending}</span>
              <span>Doing: {taskCounts.doing}</span>
              <span>Done: {taskCounts.done}</span>
            </div>
            <div className="operatorForm">
              <input
                value={taskInput}
                onChange={(event) => setTaskInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    addTask();
                  }
                }}
                placeholder="Add a safe non-sensitive task..."
                aria-label="New safe task"
              />
              <button type="button" onClick={addTask}>
                Add Task
              </button>
            </div>
            <p className="warningText">Do not add private or sensitive data.</p>
            <div className="taskList">
              {tasks.length === 0 ? (
                <p className="emptyState">No demo tasks yet.</p>
              ) : (
                tasks.map((task) => (
                  <div className="taskRow" key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <span className="statusTag">{task.status}</span>
                    </div>
                    <div className="rowActions">
                      <button
                        type="button"
                        onClick={() => updateTaskStatus(task.id, "DOING")}
                      >
                        Start
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTaskStatus(task.id, "DONE")}
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTaskStatus(task.id, "PENDING")}
                      >
                        Reset
                      </button>
                      <button type="button" onClick={() => deleteTask(task.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article
            className="operatorModule"
            aria-labelledby="knowledge-capture"
          >
            <div className="moduleHeader">
              <div>
                <span>Module 2</span>
                <h3 id="knowledge-capture">Knowledge Capture</h3>
              </div>
              <strong>{knowledgeItems.length} records</strong>
            </div>
            <textarea
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
              placeholder="Write a safe generic learning..."
              aria-label="Safe generic learning note"
            />
            <button type="button" onClick={distillNote}>
              Distill Note
            </button>
            <p className="warningText">
              Local mock only. No APIs, no external AI and no sensitive data.
            </p>
            <div className="knowledgeList">
              {knowledgeItems.length === 0 ? (
                <p className="emptyState">No distilled demo notes yet.</p>
              ) : (
                knowledgeItems.map((item) => (
                  <div className="knowledgeRecord" key={item.id}>
                    <span className="recordId">{item.id}</span>
                    <p>
                      <strong>Preview:</strong> {item.preview}
                    </p>
                    <p>
                      <strong>Distilled:</strong> {item.distilled}
                    </p>
                    <div className="recordMeta">
                      <span>{item.classification}</span>
                      <span>{item.status}</span>
                    </div>
                    <div className="rowActions">
                      <button
                        type="button"
                        onClick={() => sendToApprovalQueue(item)}
                        disabled={item.sentToApproval}
                      >
                        Send to Approval Queue
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteKnowledgeItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="operatorModule" aria-labelledby="approval-actions">
            <div className="moduleHeader">
              <div>
                <span>Module 3</span>
                <h3 id="approval-actions">Approval Queue Actions</h3>
              </div>
              <strong>{pendingApprovalCount} pending</strong>
            </div>
            <div className="approvalActionTable" aria-label="Approval actions">
              <div className="approvalActionHeader">
                <span>ID</span>
                <span>Type</span>
                <span>Risk</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {approvalItems.length === 0 ? (
                <p className="emptyState">No approval requests yet.</p>
              ) : (
                approvalItems.map((item) => (
                  <div className="approvalActionRow" key={item.id}>
                    <strong>{item.id}</strong>
                    <span>{item.type}</span>
                    <span>{item.risk}</span>
                    <span>{item.status}</span>
                    <div className="rowActions">
                      <button
                        type="button"
                        onClick={() =>
                          updateApprovalStatus(item.id, "APPROVED_MOCK")
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateApprovalStatus(item.id, "REJECTED_MOCK")
                        }
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateApprovalStatus(item.id, "BLOCKED_MOCK")
                        }
                      >
                        Block
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="warningText">
              Mock approval only. No real execution or external system control.
            </p>
          </article>
        </div>
      </section>

      <section className="systemBoundaryIntro" aria-label="System boundaries">
        <p className="eyebrow">SYSTEM BOUNDARIES</p>
        <h2>Public Demo Guardrails</h2>
        <p>
          The reference panels below document limits, future readiness and
          blocked capabilities. They remain informational.
        </p>
      </section>

      <section className="briefPanel" aria-label="Operator brief">
        <h2>Operator Brief</h2>
        <p>
          The public demo is release-ready and conservative. The system presents
          its operating model, but it does not process private work data,
          connect APIs, run backend services, or execute autonomous actions.
        </p>
      </section>

      <section className="cardGrid" aria-label="Command center modules">
        {commandCards.map((card) => (
          <article className="moduleCard" key={card.title}>
            <div className="cardHeader">
              <div>
                <span className="priority">{card.priority}</span>
                <h2>{card.title}</h2>
              </div>
              <span className="stateBadge">{card.status}</span>
            </div>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

        <section className="privateMvp" aria-labelledby="private-mvp-title">
        <div className="sectionIntro">
          <p className="eyebrow">SPRINT 8 / PRIVATE MODE MVP PREPARATION</p>
          <h2 id="private-mvp-title">Private Mode MVP Preparation</h2>
          <p>
            Private Mode is being shaped as a future controlled environment.
            This public build only shows prepared structure, boundaries and
            approval gates.
          </p>
        </div>

        <div className="prepGrid">
          <article>
            <h3>Private Mode Status</h3>
            <StatusList items={privateStatus} />
          </article>
          <article>
            <h3>Manual Private Memory</h3>
            <StatusList items={memoryStatus} />
          </article>
          <article>
            <h3>Demo Presentation Ready</h3>
            <StatusList items={presentationStatus} />
          </article>
          <article>
            <h3>Private Architecture Blueprint</h3>
            <StatusList items={architectureStatus} />
          </article>
          <article>
            <h3>Human Approval Gate</h3>
            <ul>
              {approvalGate.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Future MVP Components</h3>
            <ul>
              {futureComponents.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Critical Boundaries</h3>
            <ul>
              {criticalBoundaries.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="operatorNote">
          <strong>Operator Note</strong>
          <p>
            ULTRON is currently operating in Public Demo Mode. Private Mode is
            being prepared as a future controlled environment. No real private
            data, credentials, backend, APIs, or autonomous agents are active in
            this build.
          </p>
        </div>

        <div className="mvpMatrix" aria-label="Private mode MVP matrix">
          <div className="matrixHeader">
            <span>Component</span>
            <span>Current Status</span>
            <span>Risk</span>
            <span>Next Step</span>
          </div>
          {mvpMatrix.map((row) => (
            <div className="matrixRow" key={row.component}>
              <strong>{row.component}</strong>
              <span>{row.status}</span>
              <span>{row.risk}</span>
              <span>{row.next}</span>
            </div>
          ))}
        </div>

        <div className="realityPanel">
          <h3>Current Reality vs Future Capability</h3>
          <div className="realityGrid">
            {realityMatrix.map((row) => (
              <article key={row.capability}>
                <strong>{row.capability}</strong>
                <span>Current: {row.current}</span>
                <span>Future: {row.future}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="memoryPrototype">
          <h3>Local-Only Private Memory Prototype</h3>
          <StatusList items={localMemoryStatus} />
          <div className="mockTable" aria-label="Mock private memory records">
            <div className="mockTableHeader">
              <span>Memory Item</span>
              <span>Classification</span>
              <span>Approval</span>
              <span>Storage</span>
            </div>
            {mockMemoryItems.map((item) => (
              <div className="mockTableRow" key={item.item}>
                <strong>{item.item}</strong>
                <span>{item.classification}</span>
                <span>{item.approval}</span>
                <span>{item.storage}</span>
              </div>
            ))}
          </div>
          <p className="memoryPrototypeNote">
            This is a local-only memory prototype using mock data. No real
            private data, credentials, backend, authentication, APIs, cloud
            storage, or autonomous agents are connected.
          </p>
        </div>

        <div className="approvalPrototype">
          <h3>Approval Queue Prototype</h3>
          <StatusList items={approvalQueueStatus} />
          <div className="approvalTable" aria-label="Mock approval queue">
            <div className="approvalTableHeader">
              <span>Request</span>
              <span>Type</span>
              <span>Risk</span>
              <span>Approval</span>
              <span>Execution</span>
            </div>
            {mockApprovalRequests.map((request) => (
              <div className="approvalTableRow" key={request.request}>
                <strong>{request.request}</strong>
                <span>{request.type}</span>
                <span>{request.risk}</span>
                <span>{request.approval}</span>
                <span>{request.execution}</span>
              </div>
            ))}
          </div>
          <p className="approvalPrototypeNote">
            This approval queue is a mock prototype. No real actions, agents,
            memory writes, backend, APIs, authentication, or private data are
            connected.
          </p>
        </div>

        <div className="controlledMvp">
          <h3>Controlled Private Mode MVP</h3>
          <StatusList items={controlledPrivateModeStatus} />
          <p className="controlledMvpNote">
            Controlled Private Mode MVP is a mock-only integration layer. No
            real private data, backend, authentication, APIs, memory
            persistence, autonomous agents, or real execution are active.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
