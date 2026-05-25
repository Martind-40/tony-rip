import React, { useState, useEffect, useCallback } from "react";

const C = {
  bg1: "#0d0d0d", bg2: "#111", bg3: "#0a0a0a",
  border: "#1e1e1e", border2: "#2a2a2a",
  red: "#c0392b", redGlow: "rgba(192,57,43,0.15)",
  text: "#e8e8e8", textDim: "#888", textFaint: "#444",
  green: "#27ae60", amber: "#e67e22", orange: "#e67e22",
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

function ProgressBar({ value, max, color, height = 6 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct >= 90 ? C.red : pct >= 70 ? C.amber : color || C.green;
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 3, height, overflow: "hidden", marginTop: 4 }}>
      <div style={{
        width: `${pct}%`, height: "100%", background: barColor,
        borderRadius: 3, transition: "width 0.5s ease",
        boxShadow: pct >= 80 ? `0 0 4px ${barColor}` : "none"
      }} />
    </div>
  );
}

function MetricCard({ title, children, warning }) {
  return (
    <div style={{
      background: C.bg2, borderRadius: 5, padding: "12px 14px",
      border: `0.5px solid ${warning ? "#4a3000" : C.border}`,
      marginBottom: 10
    }}>
      <div style={{ fontSize: 9, color: warning ? C.amber : "#444", fontFamily: C.fontMono, letterSpacing: "0.12em", marginBottom: 8 }}>
        {warning && "⚠ "}{title}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, sub, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `0.5px solid ${C.border}` }}>
      <span style={{ fontSize: 11, color: C.textDim, fontFamily: C.fontMono }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: 12, color: color || C.text, fontFamily: C.fontMono, fontWeight: 500 }}>{value}</span>
        {sub && <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{sub}</div>}
      </div>
    </div>
  );
}

const PROVIDER_COLORS = {
  openai: "#10a37f", gemini: "#4285f4", claude: "#e07b39",
  ollama: "#9b59b6", local_rules: C.green, local_extraction: "#555",
  local_fallback: "#555", offline_local: "#555", unknown: "#444"
};

export default function CostsDashboard({ backendOnline }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    if (!backendOnline) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/consumption/summary");
      const d = await res.json();
      if (d.ok) { setData(d); setLastUpdated(new Date().toLocaleTimeString()); }
    } catch { /* silent */ }
    setLoading(false);
  }, [backendOnline]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!backendOnline) return;
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, [backendOnline, load]);

  const today = data?.today;
  const month = data?.month;
  const total = data?.total;
  const byProviderMonth = data?.by_provider_month || {};
  const recent = data?.recent || [];

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 16 / COST DASHBOARD</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.red, fontWeight: 600, fontFamily: C.fontMono }}>AI COST TRACKER</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lastUpdated && <span style={{ fontSize: 8, color: "#333", fontFamily: C.fontMono }}>{lastUpdated}</span>}
          <button onClick={load} disabled={loading} style={{ background: "transparent", border: `0.5px solid ${C.border2}`, borderRadius: 3, color: "#444", cursor: "pointer", fontSize: 10, padding: "3px 8px", fontFamily: C.fontMono }}>
            {loading ? "..." : "↻"}
          </button>
        </div>
      </div>

      {!backendOnline ? (
        <div style={{ fontSize: 11, color: "#444", fontFamily: C.fontMono, padding: "12px 0", textAlign: "center" }}>
          Backend offline — start with: npm run backend
        </div>
      ) : !data ? (
        <div style={{ fontSize: 11, color: "#444", fontFamily: C.fontMono, padding: "12px 0", textAlign: "center" }}>
          {loading ? "Loading..." : "No data yet"}
        </div>
      ) : (
        <>
          {/* TODAY */}
          <MetricCard title="TODAY" warning={today?.calls_pct >= 80 || today?.cost_pct >= 80}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.fontMono }}>Calls</span>
                  <span style={{ fontSize: 12, color: today?.calls_pct >= 80 ? C.red : C.text, fontFamily: C.fontMono, fontWeight: 500 }}>
                    {today?.calls} <span style={{ fontSize: 9, color: "#444" }}>/ {today?.calls_limit}</span>
                  </span>
                </div>
                <ProgressBar value={today?.calls || 0} max={today?.calls_limit || 50} color={C.green} />
                <div style={{ fontSize: 8, color: "#444", fontFamily: C.fontMono, marginTop: 3 }}>{today?.calls_pct || 0}% used</div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.fontMono }}>Cost</span>
                  <span style={{ fontSize: 12, color: today?.cost_pct >= 80 ? C.red : C.green, fontFamily: C.fontMono, fontWeight: 500 }}>
                    ${(today?.cost || 0).toFixed(4)}
                  </span>
                </div>
                <ProgressBar value={today?.cost || 0} max={today?.cost_limit || 1.00} color={C.green} />
                <div style={{ fontSize: 8, color: "#444", fontFamily: C.fontMono, marginTop: 3 }}>limit: ${today?.cost_limit || 1.00}/day</div>
              </div>
            </div>
          </MetricCard>

          {/* THIS MONTH */}
          <MetricCard title="THIS MONTH" warning={month?.cost_pct >= 80}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 20, color: month?.cost_pct >= 80 ? C.red : C.green, fontFamily: C.fontMono, fontWeight: 600 }}>
                  ${(month?.cost || 0).toFixed(4)}
                </span>
                <span style={{ fontSize: 10, color: "#444", fontFamily: C.fontMono }}> / ${month?.budget || 20}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: C.text, fontFamily: C.fontMono }}>{month?.calls || 0} calls</div>
                <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{month?.cost_pct || 0}% of budget</div>
              </div>
            </div>
            <ProgressBar value={month?.cost || 0} max={month?.budget || 20} color={C.green} height={8} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 8, color: "#333", fontFamily: C.fontMono }}>$0</span>
              <span style={{ fontSize: 8, color: month?.cost_pct >= 80 ? C.red : "#333", fontFamily: C.fontMono }}>${month?.budget || 20} budget</span>
            </div>
          </MetricCard>

          {/* BY PROVIDER */}
          {Object.keys(byProviderMonth).length > 0 && (
            <MetricCard title="THIS MONTH BY PROVIDER">
              {Object.entries(byProviderMonth)
                .sort((a, b) => b[1].cost - a[1].cost)
                .map(([provider, stats]) => {
                  const color = PROVIDER_COLORS[provider] || "#555";
                  const pct = month?.cost > 0 ? Math.round((stats.cost / month.cost) * 100) : 0;
                  return (
                    <div key={provider} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.fontMono }}>{provider}</span>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontSize: 10, color: color, fontFamily: C.fontMono }}>${stats.cost.toFixed(5)}</span>
                          <span style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{stats.calls} calls</span>
                        </div>
                      </div>
                      <div style={{ background: "#1a1a1a", borderRadius: 2, height: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
            </MetricCard>
          )}

          {/* TOTALS */}
          <MetricCard title="ALL TIME">
            <StatRow label="Total calls" value={total?.calls || 0} />
            <StatRow label="Total cost" value={`$${(total?.cost || 0).toFixed(5)}`} color={C.green} />
            <StatRow label="Avg cost/call" value={total?.calls > 0 ? `$${((total?.cost || 0) / total.calls).toFixed(6)}` : "$0"} color={C.textDim} />
          </MetricCard>

          {/* RECENT CALLS */}
          {recent.length > 0 && (
            <MetricCard title="RECENT CALLS">
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {recent.map((entry, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `0.5px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.text, fontFamily: C.fontMono }}>{entry.provider || "unknown"}</div>
                      <div style={{ fontSize: 8, color: "#444", fontFamily: C.fontMono }}>{entry.call_type || "chat"} · {entry.timestamp?.split("T")[0]}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: entry.cost_estimated > 0 ? C.amber : "#555", fontFamily: C.fontMono }}>
                        ${(entry.cost_estimated || 0).toFixed(5)}
                      </div>
                      <div style={{ fontSize: 8, color: "#333", fontFamily: C.fontMono }}>{entry.tokens_used || 0} tok</div>
                    </div>
                  </div>
                ))}
              </div>
            </MetricCard>
          )}

          {/* LIMITS REFERENCE */}
          <div style={{ background: C.bg2, borderRadius: 4, padding: "8px 10px", border: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 4 }}>CONFIGURED LIMITS</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono }}>{data?.limits?.max_calls_per_day || 50} calls/day</span>
              <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono }}>${data?.limits?.max_daily_cost_usd || 1}/day</span>
              <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono }}>${data?.limits?.max_monthly_budget_usd || 20}/month</span>
              <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono }}>{data?.limits?.max_tokens_per_request || 2000} tok/req</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
