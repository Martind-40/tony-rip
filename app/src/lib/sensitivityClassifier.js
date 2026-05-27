const CATEGORIES = {
  PUBLIC: "PUBLIC",
  INTERNAL: "INTERNAL",
  SENSITIVE: "SENSITIVE",
  CONFIDENTIAL: "CONFIDENTIAL",
  PERSONAL: "PERSONAL",
  REUSABLE_KNOWLEDGE: "REUSABLE_KNOWLEDGE"
};

const DETECTORS = [
  {
    name: "credential",
    category: CATEGORIES.CONFIDENTIAL,
    risk: 5,
    pattern: /(api[_-]?key|token|secret|password|private[_-]?key|-----BEGIN)/i
  },
  {
    name: "personal_email",
    category: CATEGORIES.PERSONAL,
    risk: 3,
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  },
  {
    name: "phone_or_card_like_number",
    category: CATEGORIES.SENSITIVE,
    risk: 4,
    pattern: /\b(?:\+?\d[\s-]?){9,16}\b/
  },
  {
    name: "confidential_marker",
    category: CATEGORIES.CONFIDENTIAL,
    risk: 5,
    pattern: /\b(confidential|nda|restricted|private|do not share)\b/i
  },
  {
    name: "internal_marker",
    category: CATEGORIES.INTERNAL,
    risk: 2,
    pattern: /\b(internal|roadmap|strategy|architecture|runbook|operator)\b/i
  },
  {
    name: "knowledge_marker",
    category: CATEGORIES.REUSABLE_KNOWLEDGE,
    risk: 1,
    pattern: /\b(lesson|decision|pattern|principle|best practice|risk|opportunity|next step)\b/i
  }
];

const CATEGORY_PRIORITY = [
  CATEGORIES.CONFIDENTIAL,
  CATEGORIES.SENSITIVE,
  CATEGORIES.PERSONAL,
  CATEGORIES.INTERNAL,
  CATEGORIES.REUSABLE_KNOWLEDGE,
  CATEGORIES.PUBLIC
];

function riskLabel(score) {
  if (score >= 5) return "CRITICAL";
  if (score >= 4) return "HIGH";
  if (score >= 3) return "MEDIUM";
  if (score >= 2) return "LOW";
  return "MINIMAL";
}

function recommendationFor(category) {
  const recommendations = {
    PUBLIC: "Safe to store as public metadata or distilled knowledge.",
    INTERNAL: "Store locally and avoid external reuse without operator review.",
    SENSITIVE: "Redact raw values and require human approval before reuse.",
    CONFIDENTIAL: "Do not store raw content; keep only a redacted review record.",
    PERSONAL: "Minimize, redact identifiers, and avoid broad reuse.",
    REUSABLE_KNOWLEDGE: "Store as distilled atoms after removing source-specific details."
  };

  return recommendations[category] || recommendations.INTERNAL;
}

export function classifySensitivity(text = "") {
  const input = String(text);
  const matches = DETECTORS.filter((detector) => detector.pattern.test(input)).map((detector) => ({
    type: detector.name,
    category: detector.category,
    risk: detector.risk
  }));

  const category =
    CATEGORY_PRIORITY.find((candidate) => matches.some((match) => match.category === candidate)) ||
    (input.trim().length > 0 ? CATEGORIES.PUBLIC : CATEGORIES.INTERNAL);

  const riskScore = matches.reduce((highest, match) => Math.max(highest, match.risk), category === CATEGORIES.PUBLIC ? 1 : 2);

  return {
    category,
    risk_level: riskLabel(riskScore),
    risk_score: riskScore,
    recommendation: recommendationFor(category),
    possible_sensitive_data: matches.map((match) => match.type),
    requires_human_approval: ["SENSITIVE", "CONFIDENTIAL", "PERSONAL"].includes(category)
  };
}

export { CATEGORIES };

