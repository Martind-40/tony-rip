import { classifySensitivity } from "./sensitivityClassifier.js";

const REDACTIONS = [
  {
    label: "[REDACTED_EMAIL]",
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  },
  {
    label: "[REDACTED_NUMBER]",
    pattern: /\b(?:\+?\d[\s-]?){9,16}\b/g
  },
  {
    label: "$1=[REDACTED]",
    pattern: /(api[_-]?key|token|secret|password|private[_-]?key)\s*[:=]\s*\S+/gi
  },
  {
    label: "[REDACTED_PRIVATE_KEY]",
    pattern: /-----BEGIN [^-]+ PRIVATE KEY-----[\s\S]*?-----END [^-]+ PRIVATE KEY-----/g
  }
];

function redactSensitiveText(text) {
  return REDACTIONS.reduce((safeText, rule) => safeText.replace(rule.pattern, rule.label), String(text || ""));
}

function linesMatching(text, words) {
  const loweredWords = words.map((word) => word.toLowerCase());
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => loweredWords.some((word) => line.toLowerCase().includes(word)))
    .slice(0, 12);
}

function atomId(project, topic, index) {
  const safeProject = String(project || "ultron").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const safeTopic = String(topic || "general").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${safeProject || "ultron"}-${safeTopic || "general"}-${Date.now()}-${index}`;
}

export function distillKnowledge(inputText = "", options = {}) {
  const classification = options.classification || classifySensitivity(inputText);
  const safeText = redactSensitiveText(inputText).replace(/\s+/g, " ").trim();
  const project = options.project || "ultron";
  const topic = options.topic || "learning-layer";
  const category = classification.category;
  const createdAt = options.created_at || new Date().toISOString();

  const learnings = linesMatching(inputText, ["learn", "lesson", "principle", "pattern", "knowledge"]);
  const decisions = linesMatching(inputText, ["decision", "decide", "chosen", "approved"]);
  const tasks = linesMatching(inputText, ["todo", "task", "next", "implement", "fix", "ship"]);
  const risks = linesMatching(inputText, ["risk", "blocker", "danger", "break", "sensitive", "credential"]);
  const opportunities = linesMatching(inputText, ["opportunity", "improve", "reuse", "automate", "optimize"]);
  const openQuestions = linesMatching(inputText, ["question", "unknown", "pending", "clarify", "?"]);

  const baseSummary = safeText.slice(0, 600) || "No reusable knowledge extracted.";
  const blockedRawStorage = ["SENSITIVE", "CONFIDENTIAL", "PERSONAL"].includes(category);

  const atoms = [
    {
      id: atomId(project, topic, 1),
      project,
      topic,
      category: category === "PUBLIC" ? "REUSABLE_KNOWLEDGE" : category,
      source_category: category,
      confidence: classification.risk_score >= 4 ? "LOW_UNTIL_REVIEW" : "MEDIUM",
      summary: blockedRawStorage ? "Sensitive input detected; only redacted distilled summary is stored." : baseSummary,
      reusable_lesson: baseSummary,
      tags: [project, topic, category.toLowerCase()].filter(Boolean),
      created_at: createdAt,
      trace: {
        source: options.source || "local_input",
        raw_storage_allowed: !blockedRawStorage,
        human_approval_required: classification.requires_human_approval
      }
    }
  ];

  return {
    project,
    topic,
    classification,
    distilled: {
      learnings: learnings.map(redactSensitiveText),
      decisions: decisions.map(redactSensitiveText),
      tasks: tasks.map(redactSensitiveText),
      risks: risks.map(redactSensitiveText),
      opportunities: opportunities.map(redactSensitiveText),
      open_questions: openQuestions.map(redactSensitiveText)
    },
    atoms,
    redacted_preview: baseSummary,
    raw_input_retention: blockedRawStorage ? "BLOCKED" : "ALLOWED_LOCAL_ONLY",
    created_at: createdAt
  };
}

export { redactSensitiveText };

