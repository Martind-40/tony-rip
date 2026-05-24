const fs = require("node:fs");
const path = require("node:path");
const { distill } = require("./knowledge_distiller.cjs");

const ROOT = "/Users/macbook/ultron";
const STORE_DIR = path.join(ROOT, ".ultron-private-memory");
const STORE_PATH = path.join(STORE_DIR, "memory.local.json");

function ensureStore() {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ records: [] }, null, 2));
  }
}

function loadStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
}

function saveStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function createRecord(note) {
  const distilled = distill(note);
  return {
    id: `PM-${Date.now().toString(36).toUpperCase()}`,
    created_at: new Date().toISOString(),
    source_type: "manual_operator_note",
    raw_sensitive_storage: "NOT_STORED",
    human_review_status: "PENDING_REVIEW",
    ...distilled
  };
}

function main() {
  const note = process.argv.slice(2).join(" ").trim();

  if (!note) {
    throw new Error("Usage: node runtime/private_memory_mvp.cjs \"safe note to distill\"");
  }

  const store = loadStore();
  const record = createRecord(note);
  store.records.unshift(record);
  saveStore(store);
  console.log(JSON.stringify(record, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { createRecord, loadStore, saveStore };
