import React from "react";
const commandCards = [
  {
    title: "Public Demo Mode",
    status: "Safe",
    body: "Uses generic sample content only. No private documents, credentials, or company data."
  },
  {
    title: "Memory Layer",
    status: "Manual",
    body: "Markdown and JSON-ready workspace for notes, tasks, decisions, and learning logs."
  },
  {
    title: "Knowledge Router",
    status: "Prepared",
    body: "Routes work by project context with clear boundaries before private mode is enabled."
  },
  {
    title: "Agent Factory",
    status: "Proposal",
    body: "Defines future assistants and approval rules without creating autonomous agents yet."
  },
  {
    title: "Vercel Ready",
    status: "Buildable",
    body: "Static Vite app prepared for deployment from the app directory with zero backend."
  }
];

function App() {
  return (
    <main className="appShell">
      <section className="heroCard" aria-labelledby="ultron-title">
        <p className="eyebrow">ULTRON / PUBLIC FOUNDATION</p>
        <h1 id="ultron-title">ULTRON Command Center</h1>
        <p className="heroText">
          A visible, stable operator dashboard for public demo mode. This build
          keeps the interface simple, readable, and safe while Vercel deployment
          is being unblocked.
        </p>
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

      <section className="cardGrid" aria-label="Command center modules">
        {commandCards.map((card) => (
          <article className="moduleCard" key={card.title}>
            <div className="cardHeader">
              <h2>{card.title}</h2>
              <span>{card.status}</span>
            </div>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
