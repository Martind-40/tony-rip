const modules = [
  {
    title: "Command Center",
    status: "Active scaffold",
    detail: "Single-screen cockpit for public-mode work routing and memory review."
  },
  {
    title: "Memory Layer",
    status: "Markdown ready",
    detail: "Tasks, decisions, meetings, stakeholders, learning log and knowledge vault."
  },
  {
    title: "Knowledge Distiller",
    status: "Prompt ready",
    detail: "Turns public-safe notes into summaries, decisions and reusable knowledge."
  },
  {
    title: "Project Router",
    status: "Policy ready",
    detail: "Routes work into ULTRON, AetherMind, Coco Venture or AetherColony placeholders."
  },
  {
    title: "Agent Factory",
    status: "Proposal only",
    detail: "Drafts future agent specs without creating live autonomous agents."
  },
  {
    title: "Autonomy Policy",
    status: "Manual only",
    detail: "Requires confirmation for risky work and blocks private data in public mode."
  }
];

const noGoItems = [
  "No private data",
  "No credentials",
  "No company documents",
  "No autonomous execution",
  "No hidden integrations"
];

const nextSteps = [
  "Install dependencies and verify build",
  "Create private-mode readiness checklist",
  "Define secure memory migration path",
  "Add real integrations only after governance approval"
];

function App() {
  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">PUBLIC MODE</p>
          <h1>ULTRON Command Center</h1>
          <p className="lede">
            Knowledge Operator, Work Assistant and Agent Commander foundation.
            Built for public-safe scaffolding now, private operations later.
          </p>
        </div>
        <div className="statusPanel" aria-label="System status">
          <span className="statusDot" />
          <strong>Base functional</strong>
          <small>No external services connected</small>
        </div>
      </section>

      <section className="grid" aria-label="Core modules">
        {modules.map((module) => (
          <article className="card" key={module.title}>
            <div className="cardHeader">
              <h2>{module.title}</h2>
              <span>{module.status}</span>
            </div>
            <p>{module.detail}</p>
          </article>
        ))}
      </section>

      <section className="twoColumn">
        <div>
          <h2>Operating Guardrails</h2>
          <ul className="checkList">
            {noGoItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Next Work</h2>
          <ol className="numberList">
            {nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

export default App;
