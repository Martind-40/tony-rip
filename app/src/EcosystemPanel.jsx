import React, { useState } from "react";

const C = {
  bg1: "#0d0d0d", bg2: "#111", bg3: "#0a0a0a",
  border: "#1e1e1e", border2: "#2a2a2a",
  red: "#c0392b", redGlow: "rgba(192,57,43,0.15)",
  text: "#e8e8e8", textDim: "#888", textFaint: "#444",
  green: "#27ae60", amber: "#e67e22", purple: "#9b59b6",
  fontMono: "'Share Tech Mono', monospace"
};

const ECOSYSTEM = [
  {
    id: "coco_venture", name: "COCO VENTURE", icon: "🚀",
    desc: "Business models · Monetization · Product · Value proposition",
    routes: ["ideas_negocio", "oportunidades_mercado", "modelo_comercial"],
    status: "READY", color: C.green,
    rule: "Only distilled business insights. No raw client data."
  },
  {
    id: "aether_colony", name: "AETHERCOLONY", icon: "🔬",
    desc: "B2B simulations · Client scenarios · Validation · Strategy",
    routes: ["simulacion_b2b", "validacion_comercial", "escenarios"],
    status: "READY", color: C.amber,
    rule: "Only anonymized patterns. No real names or credentials."
  },
  {
    id: "aether_mind", name: "AETHERMIND", icon: "🧠",
    desc: "Strategic memory · Decisions · Architecture · Learnings",
    routes: ["memoria_estrategica", "decisiones", "arquitectura"],
    status: "READY", color: C.purple,
    rule: "Only approved knowledge. Requires double confirmation."
  },
  {
    id: "ultron_core", name: "ULTRON", icon: "⚡",
    desc: "Daily commands · Tasks · Operations · Local execution",
    routes: ["comando_diario", "tareas", "operacion"],
    status: "ACTIVE", color: C.red,
    rule: "Current system. All commands via approval queue."
  },
  {
    id: "juanita_core", name: "JUANITA CORE", icon: "🌐",
    desc: "Future orchestration layer of the Aether ecosystem",
    routes: ["orquestacion_futura"],
    status: "FUTURE", color: "#444",
    rule: "Not yet implemented. Planned for future release."
  }
];

const DISTILLATION_RULE = [
  { step: 1, label: "Raw Input", icon: "📥" },
  { step: 2, label: "Permission Check", icon: "🔐" },
  { step: 3, label: "Sensitivity Filter", icon: "🔍" },
  { step: 4, label: "Knowledge Distiller", icon: "⚗" },
  { step: 5, label: "Human Approval", icon: "✅" },
  { step: 6, label: "Ecosystem Router", icon: "🔀" }
];

export default function EcosystemPanel() {
  const [selected, setSelected] = useState(null);
  const [routeInput, setRouteInput] = useState("");
  const [routeType, setRouteType] = useState("ideas_negocio");
  const [routeLog, setRouteLog] = useState([]);
  const [step, setStep] = useState(null);

  async function simulateRoute() {
    if (!routeInput.trim()) return;
    const target = ECOSYSTEM.find(e => e.routes.includes(routeType));
    if (!target || target.status === "FUTURE") return;

    for (let i = 1; i <= 6; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 300));
    }

    const entry = {
      id: `ROUTE-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      input: routeInput.slice(0, 80),
      route_type: routeType,
      destination: target.name,
      status: "ROUTED_SIMULATED",
      note: "Simulation only. No real data sent to ecosystem."
    };
    setRouteLog(prev => [entry, ...prev].slice(0, 10));
    setRouteInput("");
    setStep(null);
  }

  const allRoutes = ECOSYSTEM.flatMap(e => e.routes.filter(() => e.status !== "FUTURE"));

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 12 / ECOSYSTEM ROUTER</div>
      <div style={{ fontSize: 12, color: C.red, fontWeight: 600, fontFamily: C.fontMono, marginBottom: 12 }}>ECOSYSTEM ROUTER</div>

      {/* Distillation pipeline */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 8 }}>REQUIRED FLOW BEFORE ROUTING</div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto", paddingBottom: 4 }}>
          {DISTILLATION_RULE.map((s, i) => <React.Fragment key={s.step}>
            <div style={{ textAlign: "center", minWidth: 52, background: step === s.step ? C.redGlow : C.bg2, border: `0.5px solid ${step === s.step ? C.red : C.border}`, borderRadius: 4, padding: "5px 3px", transition: "all 0.3s" }}>
              <div style={{ fontSize: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 7, color: step === s.step ? C.red : "#444", fontFamily: C.fontMono, marginTop: 2, lineHeight: 1.2 }}>{s.label}</div>
            </div>
            {i < DISTILLATION_RULE.length - 1 && <div style={{ fontSize: 10, color: "#333", flexShrink: 0 }}>→</div>}
          </React.Fragment>)}
        </div>
      </div>

      {/* Ecosystem nodes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginBottom: 14 }}>
        {ECOSYSTEM.map(e => <button key={e.id} onClick={() => setSelected(selected === e.id ? null : e.id)} style={{
          background: selected === e.id ? C.redGlow : C.bg2,
          border: `0.5px solid ${selected === e.id ? C.red : e.status === "ACTIVE" ? e.color : C.border}`,
          borderRadius: 5, padding: "10px", cursor: e.status === "FUTURE" ? "not-allowed" : "pointer",
          textAlign: "left", opacity: e.status === "FUTURE" ? 0.4 : 1
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{e.icon}</span>
            <span style={{ fontSize: 8, color: e.color, fontFamily: C.fontMono, background: C.bg3, padding: "1px 4px", borderRadius: 2 }}>{e.status}</span>
          </div>
          <div style={{ fontSize: 10, color: e.color, fontFamily: C.fontMono, fontWeight: 600, marginBottom: 3 }}>{e.name}</div>
          <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, lineHeight: 1.4 }}>{e.desc}</div>
          {selected === e.id && <div style={{ marginTop: 8, padding: "6px", background: C.bg3, borderRadius: 3, fontSize: 8, color: C.amber, fontFamily: C.fontMono, lineHeight: 1.5 }}>⚠ {e.rule}</div>}
        </button>)}
      </div>

      {/* Route simulator */}
      <div style={{ background: C.bg2, borderRadius: 4, padding: "12px", border: `0.5px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 8 }}>ROUTE SIMULATOR (distilled knowledge only)</div>
        <select value={routeType} onChange={e => setRouteType(e.target.value)} style={{ width: "100%", background: C.bg3, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: "7px", color: C.textDim, fontFamily: C.fontMono, fontSize: 10, outline: "none", marginBottom: 6 }}>
          {allRoutes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <textarea value={routeInput} onChange={e => setRouteInput(e.target.value)} placeholder="Enter distilled knowledge to route (no raw/sensitive data)..." style={{ width: "100%", background: C.bg3, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: "8px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", minHeight: 60, resize: "vertical", marginBottom: 6 }} />
        <button onClick={simulateRoute} disabled={!routeInput.trim() || !!step} style={{ width: "100%", background: step ? C.redGlow : C.red, border: `0.5px solid ${C.red}`, borderRadius: 4, color: "#fff", fontFamily: C.fontMono, fontSize: 11, padding: "9px", cursor: step ? "not-allowed" : "pointer", opacity: !routeInput.trim() ? 0.5 : 1 }}>
          {step ? `STEP ${step}/6...` : "🔀 SIMULATE ROUTE"}
        </button>
      </div>

      {/* Route log */}
      {routeLog.length > 0 && <>
        <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 6 }}>ROUTING LOG</div>
        {routeLog.map(entry => <div key={entry.id} style={{ background: C.bg2, borderRadius: 4, padding: "8px 10px", marginBottom: 6, border: `0.5px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: C.green, fontFamily: C.fontMono }}>{entry.status}</span>
            <span style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{entry.timestamp}</span>
          </div>
          <div style={{ fontSize: 10, color: "#888", fontFamily: C.fontMono }}>→ {entry.destination} via {entry.route_type}</div>
          <div style={{ fontSize: 10, color: "#666", fontFamily: C.fontMono, marginTop: 2 }}>{entry.input}...</div>
          <div style={{ fontSize: 9, color: C.amber, fontFamily: C.fontMono, marginTop: 3 }}>⚠ {entry.note}</div>
        </div>)}
      </>}
    </div>
  );
}
