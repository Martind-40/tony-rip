const fs = require("node:fs");
const path = require("node:path");

const ROOT = "/Users/macbook/ultron";

const learningAtomsPath = path.join(ROOT, "memory", "learning_atoms.json");
const knowledgeIndexPath = path.join(ROOT, "memory", "knowledge_index.json");

function writeJson(filePath, value) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Blocked path outside ULTRON root: ${filePath}`);
  }
  fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

writeJson(learningAtomsPath, {
  version: "1.0.0",
  status: "active",
  atoms: [],
  updated_at: null
});

writeJson(knowledgeIndexPath, {
  version: "1.0.0",
  status: "active",
  projects: {},
  categories: {},
  topics: {},
  atoms: [],
  updated_at: null
});

console.log("MEMORY_SEED_RESET_OK");

