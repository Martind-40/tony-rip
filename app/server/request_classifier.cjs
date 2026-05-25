function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function includesAny(text, keywords = []) {
  return keywords.some((keyword) => text.includes(String(keyword).toLowerCase()));
}

function startsWithCommand(text) {
  return text.startsWith("/");
}

function isKnownSystemQuestion(text) {
  return text.includes("qué eres") || text.includes("que eres") || text.includes("who are you");
}

function classifyRequest(message, options = {}) {
  const policy = options.policy || {};
  const rules = policy.classification_rules || {};
  const text = normalize(message);
  const length = text.length;
  const sensitive = Boolean(options.sensitive);

  if (
    length < (rules.level0_max_chars || 20) ||
    startsWithCommand(text) ||
    isKnownSystemQuestion(text) ||
    includesAny(text, rules.level0_keywords)
  ) {
    return {
      level: 0,
      provider: "local",
      reason: length < (rules.level0_max_chars || 20) ? "short request" : "local/system trigger",
      cost_tier: "free"
    };
  }

  if (
    sensitive ||
    includesAny(text, ["privado", "private", "confidencial", "local only", "ultron", "aethernova", "aethermind", "aethercolony", "coco venture"])
  ) {
    return {
      level: 1,
      provider: "ollama",
      reason: sensitive ? "sensitive request" : "privacy keyword",
      cost_tier: "free"
    };
  }

  if (
    includesAny(text, rules.level2_keywords) ||
    (length > (rules.level2_min_chars || 200) && includesAny(text, ["repetitivo", "repetitive", "batch", "volumen", "volume"]))
  ) {
    return {
      level: 2,
      provider: "gemini",
      reason: includesAny(text, rules.level2_keywords) ? "volume/utility keyword" : "repetitive long request",
      cost_tier: "cheap"
    };
  }

  if (
    includesAny(text, rules.level3_keywords) ||
    (length > (rules.level3_min_chars || 500) && includesAny(text, ["complejo", "complex", "profundo", "deep"]))
  ) {
    return {
      level: 3,
      provider: "openai",
      reason: includesAny(text, rules.level3_keywords) ? "strong analysis keyword" : "complex long request",
      cost_tier: "paid"
    };
  }

  return {
    level: 0,
    provider: "local",
    reason: "default local fallback",
    cost_tier: "free"
  };
}

module.exports = { classifyRequest };
