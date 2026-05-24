const fs = require("node:fs");
const path = require("node:path");

const ROOT = "/Users/macbook/ultron";

function isInsideRoot(targetPath) {
  const resolved = path.resolve(targetPath);
  return resolved === ROOT || resolved.startsWith(`${ROOT}${path.sep}`);
}

function redact(text) {
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[REDACTED_NUMBER]")
    .replace(/(api[_-]?key|token|secret|password|private[_-]?key)\s*[:=]\s*\S+/gi, "$1=[REDACTED]")
    .replace(/-----BEGIN [^-]+ PRIVATE KEY-----[\s\S]*?-----END [^-]+ PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]");
}

function distill(text) {
  const redacted = redact(text);
  const compact = redacted.replace(/\s+/g, " ").trim();
  const summary = compact.slice(0, 500) || "No safe knowledge extracted.";

  return {
    classification: "PURE_KNOWLEDGE_DRAFT",
    status: "READY_FOR_HUMAN_REVIEW",
    redacted_input_preview: summary,
    distilled_knowledge: `Reusable lesson: ${summary}`,
    transfer_permission: "BLOCKED_UNTIL_HUMAN_APPROVAL"
  };
}

function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error("Usage: node runtime/knowledge_distiller.cjs <local_text_file_inside_ultron>");
  }

  const resolved = path.resolve(inputPath);

  if (!isInsideRoot(resolved)) {
    throw new Error("Input must stay inside /Users/macbook/ultron.");
  }

  const text = fs.readFileSync(resolved, "utf8");
  console.log(JSON.stringify(distill(text), null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { redact, distill };
