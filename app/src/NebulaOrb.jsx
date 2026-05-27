import React, { useEffect, useRef, useState, useCallback } from "react";

const MODES = {
  pro: {
    c1: "rgba(30,144,255,", c2: "rgba(80,180,255,", c3: "rgba(150,210,255,",
    hex: "#1e90ff", ring: "rgba(30,144,255,",
    model: "GPT-4o / CLAUDE", pers: "ANALYTICAL", status: "PRO BRAIN MODE",
    keywords: /anal[iy]|archit|código|code|debug|compar|diseña|arquitect/i
  },
  strategic: {
    c1: "rgba(155,89,182,", c2: "rgba(187,143,206,", c3: "rgba(210,180,230,",
    hex: "#9b59b6", ring: "rgba(155,89,182,",
    model: "SONNET / GEMINI", pers: "STRATEGIC", status: "NEBULA PROTOCOL",
    keywords: /estrateg|decisi|planif|conocim|ecosistem|aether|coco/i
  },
  alert: {
    c1: "rgba(192,57,43,", c2: "rgba(231,76,60,", c3: "rgba(255,160,130,",
    hex: "#e74c3c", ring: "rgba(231,76,60,",
    model: "FAST RESPONSE", pers: "INTENSE", status: "SUPERNOVA ALERT",
    keywords: /urgen|alert|riesgo|peligr|crítico|bloqu|error/i
  },
  joyful: {
    c1: "rgba(46,213,115,", c2: "rgba(0,184,148,", c3: "rgba(129,236,200,",
    hex: "#2ed573", ring: "rgba(46,213,115,",
    model: "GROQ FAST", pers: "PLAYFUL 😄", status: "JOYFUL ONLINE",
    keywords: /jaja|chiste|gracioso|divert|feliz|cool|genial|excelente/i
  },
  dark: {
    c1: "rgba(50,50,80,", c2: "rgba(30,30,50,", c3: "rgba(90,90,120,",
    hex: "#4a4a6a", ring: "rgba(60,60,90,",
    model: "LOCAL ONLY", pers: "SILENT", status: "DARK PROTOCOL",
    keywords: /secreto|privado|confidenci|restringid|clasif/i
  }
};

function detectMode(text) {
  for (const [key, m] of Object.entries(MODES)) {
    if (m.keywords && m.keywords.test(text)) return key;
  }
  return null;
}

function rnd(a, b) { return a + Math.random() * (b - a); }

export default function NebulaOrb({ listening, onToggleListen, currentMessage, activeModel, backendOnline }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const [mode, setMode] = useState("pro");
  const modeRef = useRef("pro");

  // Auto-detect mode from message context
  useEffect(() => {
    if (!currentMessage) return;
    const detected = detectMode(currentMessage);
    if (detected && detected !== modeRef.current) {
      modeRef.current = detected;
      setMode(detected);
    }
  }, [currentMessage]);

  // Also detect from activeModel
  useEffect(() => {
    if (activeModel === "auto" || !activeModel) return;
    if (["openai", "claude"].includes(activeModel)) { modeRef.current = "pro"; setMode("pro"); }
    else if (["gemini"].includes(activeModel)) { modeRef.current = "strategic"; setMode("strategic"); }
    else if (["groq"].includes(activeModel)) { modeRef.current = "joyful"; setMode("joyful"); }
    else if (["ollama"].includes(activeModel)) { modeRef.current = "dark"; setMode("dark"); }
  }, [activeModel]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CW = 290, CH = 290, CX = 145, CY = 145;
    const m = MODES[modeRef.current];
    tRef.current += 0.016;
    const t = tRef.current;
    const isListen = listening;

    ctx.clearRect(0, 0, CW, CH);

    if (modeRef.current === "pro") {
      // Brain electric mode — blue
      const r = isListen ? 66 + Math.sin(t * 5) * 12 : 60 + Math.sin(t * 1.5) * 5;

      // Outer halo
      const halo = ctx.createRadialGradient(CX, CY, r * 0.5, CX, CY, r * 2.2);
      halo.addColorStop(0, m.c1 + "0.0)");
      halo.addColorStop(0.4, m.c1 + "0.1)");
      halo.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(CX, CY, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = halo; ctx.fill();

      // Brain lobes
      [CX - 28, CX + 28].forEach(lx => {
        const lg = ctx.createRadialGradient(lx, CY, 0, lx, CY, r * 0.9);
        lg.addColorStop(0, m.c2 + "0.55)");
        lg.addColorStop(0.5, m.c1 + "0.2)");
        lg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.ellipse(lx, CY, r * 0.78, r * 0.88, 0, 0, Math.PI * 2);
        ctx.fillStyle = lg; ctx.fill();
      });

      // Brain fold wrinkles
      for (let i = 0; i < 14; i++) {
        const a = t * 0.3 + i * (Math.PI / 7);
        const fx = CX + Math.cos(a) * r * 0.52, fy = CY + Math.sin(a) * r * 0.52;
        const fw = 18 + Math.sin(t * 1.5 + i) * 8;
        ctx.beginPath();
        ctx.moveTo(fx - fw * 0.5, fy);
        ctx.bezierCurveTo(fx - fw * 0.2, fy - 8 + Math.sin(t + i) * 4, fx + fw * 0.2, fy - 8 + Math.cos(t + i) * 4, fx + fw * 0.5, fy);
        ctx.strokeStyle = m.c1 + (0.07 + Math.sin(t + i) * 0.04) + ")";
        ctx.lineWidth = 0.8; ctx.stroke();
      }

      // Circuit traces
      for (let i = 0; i < 18; i++) {
        const a = i * (Math.PI * 2 / 18) + t * 0.1;
        const r1 = r * 0.28 + Math.sin(t * 2 + i) * 8;
        const r2 = r * 0.68 + Math.cos(t * 1.5 + i) * 12;
        const sx = CX + Math.cos(a) * r1, sy = CY + Math.sin(a) * r1;
        const ex = CX + Math.cos(a) * r2, ey = CY + Math.sin(a) * r2;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + (ex - sx) * 0.5 + Math.sin(t * 3 + i) * 8, sy + (ey - sy) * 0.5 + Math.cos(t * 3 + i) * 8, ex, ey);
        ctx.strokeStyle = m.c1 + (0.04 + Math.sin(t * 2 + i) * 0.04) + ")";
        ctx.lineWidth = 0.5; ctx.stroke();
      }

      // Neural nodes
      for (let i = 0; i < 24; i++) {
        const a = t * 0.5 + i * (Math.PI * 2 / 24);
        const nr = r * (0.28 + Math.sin(t * 1.2 + i * 0.7) * 0.32);
        ctx.beginPath(); ctx.arc(CX + Math.cos(a) * nr, CY + Math.sin(a) * nr, 1.5 + Math.sin(t * 2 + i) * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = m.c2 + (0.5 + Math.sin(t + i) * 0.3) + ")"; ctx.fill();
      }

      // Electric arcs
      const arcCount = isListen ? 22 : 7;
      for (let i = 0; i < arcCount; i++) {
        const a = rnd(0, Math.PI * 2);
        const start = r * (0.18 + Math.random() * 0.5);
        const end = r * (0.55 + Math.random() * 0.55);
        const sx = CX + Math.cos(a) * start, sy = CY + Math.sin(a) * start;
        const ex = CX + Math.cos(a + rnd(-0.9, 0.9)) * end;
        const ey = CY + Math.sin(a + rnd(-0.9, 0.9)) * end;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        const segs = 3 + Math.floor(Math.random() * 5);
        for (let s = 0; s < segs; s++) {
          const tt = (s + 1) / (segs + 1);
          ctx.lineTo(sx + (ex - sx) * tt + rnd(-16, 16), sy + (ey - sy) * tt + rnd(-16, 16));
        }
        ctx.lineTo(ex, ey);
        const alpha = isListen ? 0.4 + Math.random() * 0.6 : 0.12 + Math.random() * 0.2;
        ctx.strokeStyle = isListen ? m.c3 + alpha + ")" : m.c1 + alpha + ")";
        ctx.lineWidth = isListen ? 0.5 + Math.random() * 2 : 0.3 + Math.random() * 0.8;
        ctx.shadowColor = m.hex; ctx.shadowBlur = isListen ? 10 : 3;
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      // Core glow
      const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, r * 0.52);
      cg.addColorStop(0, "rgba(200,235,255,0.9)");
      cg.addColorStop(0.25, m.c3 + "0.8)");
      cg.addColorStop(0.55, m.c2 + "0.4)");
      cg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(CX, CY, r * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();

      // Data codes
      const codes = ["CS01-3A", "A784-9F", "7BE2-85", "SC00FF", "A7BE-X11", "7B55", "QE4A2", "REF_ACE"];
      codes.forEach((code, i) => {
        const a = t * 0.12 + i * (Math.PI * 2 / codes.length);
        const tr = r + 20 + Math.sin(t + i) * 4;
        ctx.save(); ctx.translate(CX + Math.cos(a) * tr, CY + Math.sin(a) * tr);
        ctx.rotate(a + Math.PI * 0.5);
        ctx.font = `${isListen ? 8 : 7}px 'Share Tech Mono',monospace`;
        ctx.fillStyle = m.c1 + (isListen ? 0.38 : 0.16) + ")";
        ctx.fillText(code, -code.length * 2.5, 0);
        ctx.restore();
      });

    } else if (modeRef.current === "strategic") {
      // Nebula purple
      const r = isListen ? 64 + Math.sin(t * 4) * 10 : 58 + Math.sin(t) * 5;
      for (let i = 0; i < 7; i++) {
        const a = t * 0.6 + i * (Math.PI / 3.5);
        const nx = CX + Math.cos(a) * (r * 0.55 + Math.sin(t * 1.2 + i) * 18) * 0.5;
        const ny = CY + Math.sin(a) * (r * 0.55 + Math.sin(t * 1.2 + i) * 18) * 0.5;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 44 + Math.sin(t + i) * 14);
        g.addColorStop(0, m.c1 + (0.2 + Math.sin(t * 0.8 + i) * 0.08) + ")");
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(nx, ny, 50, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }
      const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, r);
      cg.addColorStop(0, m.c3 + "0.9)"); cg.addColorStop(0.3, m.c1 + "0.6)");
      cg.addColorStop(0.7, m.c2 + "0.2)"); cg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      for (let i = 0; i < 14; i++) {
        const a = t * 0.35 + i * (Math.PI * 2 / 14);
        const len = r + rnd(18, 55);
        const sx = CX + Math.cos(a) * r * 0.8, sy = CY + Math.sin(a) * r * 0.8;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        ctx.strokeStyle = m.c1 + (0.06 + Math.random() * 0.1) + ")"; ctx.lineWidth = 0.5; ctx.stroke();
      }
      if (isListen) for (let i = 0; i < 12; i++) {
        const a = rnd(0, Math.PI * 2), len = rnd(25, 72);
        const sx = CX + Math.cos(a) * r, sy = CY + Math.sin(a) * r;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        for (let s = 0; s < 4; s++) ctx.lineTo(sx + Math.cos(a) * len * (s + 1) / 5 + rnd(-14, 14), sy + Math.sin(a) * len * (s + 1) / 5 + rnd(-14, 14));
        ctx.strokeStyle = m.c2 + "0.65)"; ctx.lineWidth = 0.8; ctx.stroke();
      }

    } else if (modeRef.current === "alert") {
      // Supernova red
      const r = isListen ? 68 + Math.sin(t * 5) * 12 : 62 + Math.sin(t * 1.8) * 7;
      for (let i = 0; i < 4; i++) {
        const rr = r * (0.4 + i * 0.3) + Math.sin(t * 2 + i) * 10;
        const g = ctx.createRadialGradient(CX, CY, rr * 0.6, CX, CY, rr);
        g.addColorStop(0, "transparent"); g.addColorStop(0.6, m.c1 + (0.1 - i * 0.02) + ")"); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(CX, CY, rr, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }
      for (let i = 0; i < 22; i++) {
        const a = t * 0.7 + i * (Math.PI * 2 / 22), len = r + rnd(22, 90);
        const sx = CX + Math.cos(a) * (r - 6), sy = CY + Math.sin(a) * (r - 6);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        ctx.strokeStyle = m.c3 + (0.04 + Math.random() * 0.12) + ")"; ctx.lineWidth = rnd(0.3, 1.5); ctx.stroke();
      }
      const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, r);
      cg.addColorStop(0, "rgba(255,200,180,0.95)"); cg.addColorStop(0.2, m.c3 + "0.9)");
      cg.addColorStop(0.5, m.c1 + "0.5)"); cg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      if (isListen) for (let i = 0; i < 20; i++) {
        const a = rnd(0, Math.PI * 2), len = rnd(30, 95);
        const sx = CX + Math.cos(a) * r, sy = CY + Math.sin(a) * r;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        for (let s = 0; s < 6; s++) ctx.lineTo(sx + Math.cos(a) * len * (s + 1) / 7 + rnd(-22, 22), sy + Math.sin(a) * len * (s + 1) / 7 + rnd(-22, 22));
        ctx.strokeStyle = m.c3 + "0.7)"; ctx.lineWidth = 0.5 + Math.random() * 2;
        ctx.shadowColor = m.hex; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(sx + Math.cos(a) * len, sy + Math.sin(a) * len, 2, 0, Math.PI * 2);
        ctx.fillStyle = m.c3 + "0.8)"; ctx.fill();
      }

    } else if (modeRef.current === "joyful") {
      // Joyful green multicolor
      const r = isListen ? 68 + Math.sin(t * 7) * 14 : 60 + Math.sin(t * 2.5) * 9;
      const cols = ["rgba(46,213,115,", "rgba(0,184,148,", "rgba(52,152,219,", "rgba(155,89,182,", "rgba(241,196,15,"];
      for (let i = 0; i < cols.length; i++) {
        const rr = r * (0.35 + i * 0.2) + Math.sin(t * 3 + i) * 12;
        ctx.beginPath(); ctx.arc(CX, CY, rr, 0, Math.PI * 2);
        ctx.strokeStyle = cols[i] + (0.22 + Math.sin(t * 2 + i) * 0.1) + ")";
        ctx.lineWidth = 1.2 + Math.sin(t + i) * 0.8; ctx.stroke();
      }
      for (let i = 0; i < 22; i++) {
        const a = t * 1.8 + i * (Math.PI * 2 / 22), pr = r + rnd(12, 55);
        ctx.beginPath(); ctx.arc(CX + Math.cos(a) * pr, CY + Math.sin(a) * pr, rnd(1, 3), 0, Math.PI * 2);
        ctx.fillStyle = cols[i % cols.length] + rnd(0.3, 0.8) + ")"; ctx.fill();
      }
      const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, r);
      cg.addColorStop(0, "rgba(200,255,220,0.95)"); cg.addColorStop(0.3, "rgba(129,236,200,0.8)");
      cg.addColorStop(0.6, m.c1 + "0.4)"); cg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      if (isListen) for (let i = 0; i < 16; i++) {
        const a = rnd(0, Math.PI * 2), len = rnd(28, 80);
        const sx = CX + Math.cos(a) * r, sy = CY + Math.sin(a) * r;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(a + rnd(-0.6, 0.6)) * len, sy + Math.sin(a + rnd(-0.6, 0.6)) * len);
        ctx.strokeStyle = cols[Math.floor(Math.random() * cols.length)] + "0.8)";
        ctx.lineWidth = rnd(0.5, 2); ctx.stroke();
      }

    } else {
      // Dark protocol
      const r = isListen ? 60 + Math.sin(t * 2) * 6 : 52 + Math.sin(t * 0.5) * 3;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(CX, CY, r * (0.5 + i * 0.25), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(70,70,100,${0.1 - i * 0.02})`; ctx.lineWidth = 1; ctx.stroke();
      }
      const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, r);
      cg.addColorStop(0, "rgba(100,100,140,0.5)"); cg.addColorStop(0.5, "rgba(40,40,65,0.4)"); cg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      if (isListen) for (let i = 0; i < 5; i++) {
        const a = rnd(0, Math.PI * 2), len = rnd(18, 45);
        const sx = CX + Math.cos(a) * r, sy = CY + Math.sin(a) * r;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        ctx.strokeStyle = "rgba(100,100,180,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [listening]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const m = MODES[mode];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Orb */}
      <div onClick={onToggleListen} style={{
        position: "relative", width: 240, height: 240,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", WebkitTapHighlightColor: "transparent",
        animation: "float 5s ease-in-out infinite"
      }}>
        {/* Pulse rings */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", width: 130, height: 130, borderRadius: "50%",
            border: `1px solid ${m.ring}0.5)`,
            animation: `pulseOut 3.2s ease-out ${i * 1.07}s infinite`
          }} />
        ))}
        {/* Rotating rings */}
        <div style={{ position: "absolute", width: 168, height: 168, borderRadius: "50%", border: `0.5px dashed ${m.ring}0.45)`, animation: "ring1 9s linear infinite" }} />
        <div style={{ position: "absolute", width: 196, height: 196, borderRadius: "50%", border: `0.5px solid ${m.ring}0.2)`, borderTopColor: `${m.ring}0.8)`, animation: "ring2 6s linear infinite" }} />
        <div style={{ position: "absolute", width: 232, height: 232, borderRadius: "50%", border: `0.5px dashed ${m.ring}0.15)`, borderLeftColor: `${m.ring}0.5)`, animation: "ring3 14s linear infinite" }} />
        {/* Canvas */}
        <canvas ref={canvasRef} width={290} height={290} style={{ position: "absolute", inset: -25, pointerEvents: "none", zIndex: 5 }} />
        {/* Shell */}
        <div style={{
          width: 130, height: 130, borderRadius: "50%", position: "relative", zIndex: 10,
          boxShadow: `0 0 40px ${m.hex}66, 0 0 80px ${m.hex}22, inset 0 0 30px ${m.hex}22`,
          transition: "box-shadow 1s"
        }} />
      </div>

      {/* Mode indicator */}
      <div style={{ fontSize: 9, color: m.hex, fontFamily: "'Share Tech Mono',monospace", letterSpacing: "0.14em", marginTop: 8, opacity: 0.8 }}>
        {m.pers} — {m.status}
      </div>
    </div>
  );
}
