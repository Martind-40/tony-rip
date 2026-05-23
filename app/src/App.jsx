import React from "react";

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
