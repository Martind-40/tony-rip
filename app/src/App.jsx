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
          A stable operator terminal for safe knowledge work demos: visible
          command modules, public-only narrative, and zero backend dependencies.
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
          <span>Private Data</span>
          <strong>0</strong>
        </div>
        <div>
          <span>Backend</span>
          <strong>None</strong>
        </div>
        <div>
          <span>Deploy Target</span>
          <strong>Vercel</strong>
        </div>
      </section>

      <section className="briefPanel" aria-label="Operator brief">
        <h2>Operator Brief</h2>
        <p>
          Sprint 4 keeps the public demo polished and conservative. The system
          can present its operating model, but it does not process private work
          data or execute autonomous actions.
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
    </main>
  );
}

export default App;
