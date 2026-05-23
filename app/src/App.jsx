const dailyBrief = [
  { label: "Focus", value: "Stabilize public command center UX" },
  { label: "Mode", value: "PUBLIC MODE / safe examples only" },
  { label: "Readiness", value: "Functional base, private mode pending" }
];

const tasks = [
  {
    title: "Review memory files",
    meta: "Today",
    status: "Ready",
    detail: "Confirm public-safe notes and remove anything that looks private."
  },
  {
    title: "Prepare private-mode gate",
    meta: "Next",
    status: "Planned",
    detail: "Define data classes, secret policy, access rules and review flow."
  },
  {
    title: "Design daily operator loop",
    meta: "Sprint 1",
    status: "Draft",
    detail: "Turn the brief, tasks and reports into a repeatable work rhythm."
  }
];

const vaultItems = [
  "Public charter and operating rules",
  "Manual memory scaffold",
  "Project routing placeholders",
  "Agent proposal templates"
];

const routes = [
  { name: "ULTRON", signal: "Active", note: "Command center, memory and UX" },
  { name: "AetherMind", signal: "Placeholder", note: "Public-safe governance reference" },
  { name: "Coco Venture", signal: "Placeholder", note: "Public-safe venture review pattern" },
  { name: "AetherColony", signal: "Placeholder", note: "Public-safe evidence validation pattern" }
];

const agents = [
  { name: "Knowledge Distiller", state: "Proposed", output: "Briefs, summaries, decisions" },
  { name: "Project Router", state: "Proposed", output: "Route, confidence, caveat" },
  { name: "Agent Factory", state: "Proposal only", output: "Future agent specs" }
];

const reports = [
  { metric: "Validated private data", value: "0", tone: "safe" },
  { metric: "External integrations", value: "0", tone: "safe" },
  { metric: "Build status", value: "PASS", tone: "good" },
  { metric: "Autonomy level", value: "Manual", tone: "safe" }
];

const futureCapabilities = [
  "Private-mode memory with access controls",
  "Human-approved screen operator",
  "Local file review with redaction rules",
  "Calendar and work system connectors",
  "Agent command queue with approvals"
];

function StatusPill({ children, tone = "neutral" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function Section({ eyebrow, title, children, className = "", id }) {
  return (
    <section className={`panel ${className}`} id={id}>
      <div className="sectionHeader">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function App() {
  return (
    <main className="commandShell">
      <header className="topBar">
        <div className="brandBlock">
          <span className="brandMark">U</span>
          <div>
            <strong>ULTRON</strong>
            <small>Knowledge Operator</small>
          </div>
        </div>
        <nav aria-label="Command center sections">
          <a href="#brief">Brief</a>
          <a href="#tasks">Tasks</a>
          <a href="#router">Router</a>
          <a href="#agents">Agents</a>
        </nav>
      </header>

      <section className="heroPanel">
        <div className="heroCopy">
          <StatusPill tone="safe">PUBLIC MODE</StatusPill>
          <h1>Command Center for controlled knowledge work.</h1>
          <p>
            A zero-cost operational cockpit for briefs, tasks, routing,
            knowledge distillation and future agent command. No private data.
            No credentials. No autonomous execution.
          </p>
        </div>
        <div className="readinessCard" aria-label="Operational readiness">
          <div className="radar">
            <span />
          </div>
          <dl>
            <div>
              <dt>Mode</dt>
              <dd>Public-safe</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd>Zero</dd>
            </div>
            <div>
              <dt>Deploy</dt>
              <dd>Vercel-ready</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="dashboardGrid">
        <Section eyebrow="01" title="Daily Brief" className="spanTwo" id="brief">
          <div className="briefGrid">
            {dailyBrief.map((item) => (
              <article className="briefItem" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="02" title="Reports">
          <div className="reportList">
            {reports.map((item) => (
              <div className="reportRow" key={item.metric}>
                <span>{item.metric}</span>
                <StatusPill tone={item.tone}>{item.value}</StatusPill>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="03" title="Tasks" className="spanTwo" id="tasks">
          <div className="taskStack">
            {tasks.map((task) => (
              <article className="taskItem" key={task.title}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.detail}</p>
                </div>
                <div className="taskMeta">
                  <span>{task.meta}</span>
                  <StatusPill>{task.status}</StatusPill>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="04" title="Knowledge Vault">
          <ul className="vaultList">
            {vaultItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section eyebrow="05" title="Project Router" className="spanTwo" id="router">
          <div className="routeTable">
            {routes.map((route) => (
              <article key={route.name}>
                <strong>{route.name}</strong>
                <StatusPill tone={route.signal === "Active" ? "good" : "neutral"}>
                  {route.signal}
                </StatusPill>
                <p>{route.note}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="06" title="Agent Factory" id="agents">
          <div className="agentList">
            {agents.map((agent) => (
              <article key={agent.name}>
                <div>
                  <strong>{agent.name}</strong>
                  <p>{agent.output}</p>
                </div>
                <StatusPill>{agent.state}</StatusPill>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="07" title="Future Capabilities" className="spanThree">
          <div className="futureGrid">
            {futureCapabilities.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </Section>
      </section>
    </main>
  );
}

export default App;
