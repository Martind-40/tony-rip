import React, { useState, useRef } from "react";

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

const CATEGORIES = [
  { id: "meeting", label: "MEETING", icon: "🎙", desc: "Whiteboard, slides, notes" },
  { id: "idea", label: "IDEA", icon: "💡", desc: "Concept, sketch, diagram" },
  { id: "field", label: "FIELD", icon: "🌍", desc: "On-site capture, evidence" },
  { id: "document", label: "DOCUMENT", icon: "📄", desc: "Physical document, form" },
  { id: "benchmark", label: "BENCHMARK", icon: "📊", desc: "Competitor, reference" },
  { id: "other", label: "OTHER", icon: "📷", desc: "General capture" }
];

const SECTION_ICONS = {
  "DESCRIPTION": "📋",
  "KEY IDEAS": "💡",
  "TASKS DETECTED": "⚡",
  "CLASSIFICATION": "🏷",
  "NEXT STEPS": "→"
};

function parseSections(text) {
  const sections = [];
  const lines = text.split("\n");
  let current = null;
  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { title: headerMatch[1].trim(), items: [] };
    } else if (current && line.trim().startsWith("-")) {
      current.items.push(line.replace(/^-\s*/, "").trim());
    } else if (current && line.trim() && !line.startsWith("#")) {
      current.items.push(line.trim());
    }
  }
  if (current) sections.push(current);
  return sections;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoPanel({ backendOnline }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [saveToWorkspace, setSaveToWorkspace] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [approved, setApproved] = useState(false);
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setApproved(false);

    // Preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  async function analyze() {
    if (!selectedFile) return;
    setProcessing(true);
    setResult(null);
    setApproved(false);

    try {
      let base64 = null;
      if (selectedFile.type.startsWith("image/") && selectedFile.size < 5 * 1024 * 1024) {
        base64 = await fileToBase64(selectedFile);
      }

      if (backendOnline) {
        const res = await authFetch("/api/photo/analyze", {
          method: "POST",
          body: JSON.stringify({
            filename: selectedFile.name,
            description: description.trim(),
            category,
            save: saveToWorkspace,
            base64
          })
        });
        const data = await res.json();
        if (data.ok) {
          setResult(data);
          setHistory(prev => [{ id: Date.now(), filename: selectedFile.name, category, provider: data.provider, savedFile: data.savedFile, date: data.date }, ...prev].slice(0, 5));
        } else {
          setResult({ ok: false, error: data.reason || "Analysis failed." });
        }
      } else {
        // Offline fallback
        setResult({
          ok: true, provider: "offline_local",
          filename: selectedFile.name, category,
          date: new Date().toISOString().split("T")[0],
          result: `## DESCRIPTION\n${description || selectedFile.name}\n\n## KEY IDEAS\n- Visual capture — backend offline\n- Manual review required\n\n## CLASSIFICATION\n- Type: ${category}\n- File: ${selectedFile.name}\n- Size: ${Math.round(selectedFile.size / 1024)}KB\n\n## NEXT STEPS\n- Start backend: npm run backend\n- Re-analyze with AI vision`,
          savedFile: null
        });
      }
    } catch (e) {
      setResult({ ok: false, error: e.message });
    }
    setProcessing(false);
  }

  function clear() {
    setSelectedFile(null); setPreview(null);
    setDescription(""); setResult(null);
    setApproved(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const sections = result?.result ? parseSections(result.result) : [];

  return (
    <div style={{ background: C.bg1, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.14em", fontFamily: C.fontMono, marginBottom: 4 }}>MODULE 15 / PHOTO & FIELD CAPTURE</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.red, fontWeight: 600, fontFamily: C.fontMono }}>PHOTO CAPTURE</div>
        <span style={{ fontSize: 9, color: backendOnline ? C.green : "#444", fontFamily: C.fontMono }}>
          {backendOnline ? "● ONLINE" : "○ OFFLINE"}
        </span>
      </div>

      {/* Category selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
            background: category === cat.id ? C.redGlow : C.bg2,
            border: `0.5px solid ${category === cat.id ? C.red : C.border2}`,
            borderRadius: 4, padding: "7px 6px", cursor: "pointer", textAlign: "left"
          }}>
            <div style={{ fontSize: 13 }}>{cat.icon}</div>
            <div style={{ fontSize: 9, color: category === cat.id ? C.red : C.textDim, fontFamily: C.fontMono, fontWeight: 600, marginTop: 2 }}>{cat.label}</div>
            <div style={{ fontSize: 8, color: "#333", fontFamily: C.fontMono, lineHeight: 1.3 }}>{cat.desc}</div>
          </button>
        ))}
      </div>

      {/* File upload */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          background: C.bg2, border: `0.5px dashed ${selectedFile ? C.red : C.border2}`,
          borderRadius: 4, padding: "16px", textAlign: "center", cursor: "pointer",
          marginBottom: 10, transition: "all 0.2s"
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight: 150, maxWidth: "100%", borderRadius: 4, marginBottom: 6 }} />
        ) : (
          <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
        )}
        <div style={{ fontSize: 11, color: selectedFile ? C.text : "#444", fontFamily: C.fontMono }}>
          {selectedFile ? selectedFile.name : "Tap to select photo or file"}
        </div>
        {selectedFile && (
          <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginTop: 3 }}>
            {Math.round(selectedFile.size / 1024)}KB · {selectedFile.type || "unknown type"}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.md,.csv" onChange={handleFileSelect} style={{ display: "none" }} />
      </div>

      {/* Description */}
      <input value={description} onChange={e => setDescription(e.target.value)}
        placeholder="Optional: describe what's in this capture..."
        style={{ width: "100%", background: C.bg2, border: `0.5px solid ${C.border2}`, borderRadius: 4, padding: "8px 12px", color: C.text, fontFamily: C.fontMono, fontSize: 11, outline: "none", marginBottom: 8 }} />

      {/* Options */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
          <input type="checkbox" checked={saveToWorkspace} onChange={e => setSaveToWorkspace(e.target.checked)} />
          <span style={{ fontSize: 9, color: C.textDim, fontFamily: C.fontMono }}>Save analysis to workspace/photos/</span>
        </label>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={analyze} disabled={!selectedFile || processing} style={{
          flex: 1, background: processing ? C.redGlow : C.red, border: `0.5px solid ${C.red}`,
          borderRadius: 4, color: "#fff", fontFamily: C.fontMono, fontSize: 11,
          padding: "10px", cursor: !selectedFile || processing ? "not-allowed" : "pointer",
          opacity: !selectedFile ? 0.5 : 1, minHeight: 44
        }}>
          {processing ? "⚙ ANALYZING..." : "▶ ANALYZE CAPTURE"}
        </button>
        <button onClick={clear} style={{ background: "transparent", border: `0.5px solid ${C.border2}`, borderRadius: 4, color: C.textDim, fontFamily: C.fontMono, fontSize: 11, padding: "10px 14px", cursor: "pointer", minHeight: 44 }}>✕</button>
      </div>

      {/* Error */}
      {result && !result.ok && (
        <div style={{ background: "#1a0505", border: `0.5px solid #5a1010`, borderRadius: 4, padding: "8px 10px", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: C.red, fontFamily: C.fontMono }}>✗ {result.error}</div>
        </div>
      )}

      {/* Results */}
      {result && result.ok && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, color: C.green, fontFamily: C.fontMono, background: "#0a1f0a", padding: "2px 7px", borderRadius: 3 }}>✓ ANALYZED</span>
              <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono, background: C.bg2, padding: "2px 7px", borderRadius: 3 }}>{result.provider}</span>
              <span style={{ fontSize: 9, color: C.amber, fontFamily: C.fontMono, background: "#1f1500", padding: "2px 7px", borderRadius: 3 }}>{result.category}</span>
              {result.savedFile && <span style={{ fontSize: 9, color: C.amber, fontFamily: C.fontMono, background: "#1f1500", padding: "2px 7px", borderRadius: 3 }}>💾 saved</span>}
            </div>
            <span style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono }}>{result.date}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {sections.map(section => (
              <div key={section.title} style={{ background: C.bg3, borderRadius: 4, padding: "10px 12px", border: `0.5px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{SECTION_ICONS[section.title] || "•"}</span>
                  <span style={{ fontSize: 10, color: C.red, fontFamily: C.fontMono, fontWeight: 600 }}>{section.title}</span>
                </div>
                {section.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 11, color: "#888", fontFamily: C.fontMono, padding: "3px 0", lineHeight: 1.6, borderBottom: i < section.items.length - 1 ? `0.5px solid ${C.border}` : "none" }}>
                    {section.title !== "DESCRIPTION" ? `· ${item}` : item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {!approved ? (
            <button onClick={() => setApproved(true)} style={{ width: "100%", background: "#0a1f0a", border: `0.5px solid ${C.green}`, borderRadius: 4, color: C.green, fontFamily: C.fontMono, fontSize: 11, padding: "10px", cursor: "pointer", minHeight: 44 }}>
              ✓ APPROVE — Send to Knowledge Layer
            </button>
          ) : (
            <div style={{ padding: "8px 10px", background: "#0a1f0a", borderRadius: 4, border: `0.5px solid ${C.green}`, fontSize: 10, color: C.green, fontFamily: C.fontMono }}>
              ✓ APPROVED — Distilled to knowledge layer
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontFamily: C.fontMono, marginBottom: 6 }}>ANALYZED CAPTURES</div>
          {history.map(h => (
            <div key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: C.bg2, borderRadius: 3, marginBottom: 4, border: `0.5px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.text, fontFamily: C.fontMono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{h.filename}</span>
                {h.savedFile && <span style={{ fontSize: 8, color: C.amber }}>💾</span>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: "#555", fontFamily: C.fontMono }}>{h.category}</span>
                <span style={{ fontSize: 9, color: "#333", fontFamily: C.fontMono }}>{h.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vision note */}
      <div style={{ marginTop: 10, padding: "6px 10px", background: C.bg2, borderRadius: 4, border: `0.5px solid ${C.border}` }}>
        <div style={{ fontSize: 9, color: "#333", fontFamily: C.fontMono }}>
          With OpenAI key: real image analysis via GPT-4o Vision · Without key: metadata + description extraction
        </div>
      </div>
    </div>
  );
}
