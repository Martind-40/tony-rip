const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "../../");
const RUNTIME_ROOT = path.join(PROJECT_ROOT, "runtime");
const DB_PATH = path.join(RUNTIME_ROOT, "ultron.db");
const FALLBACK_PATH = path.join(RUNTIME_ROOT, "ultron-db-fallback.json");

const SENSITIVE_PATTERNS = [
  /\bpassword\b/i,
  /\bcontraseña\b/i,
  /\btoken\b/i,
  /\bsecret\b/i,
  /\bcredential\b/i,
  /\bapi[_-]?key\b/i,
  /sk-[a-zA-Z0-9]+/
];

function hasSensitiveData(value) {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(String(value || "")));
}

function now() {
  return new Date().toISOString();
}

function clampImportance(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function normalizeTaskType(value) {
  const allowed = ["chat", "meeting", "distill", "agent", "photo", "ecosystem"];
  return allowed.includes(value) ? value : "chat";
}

function emptyFallback() {
  return { memories: [], task_log: [], usage_patterns: [] };
}

function loadFallback() {
  try {
    return { ...emptyFallback(), ...JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf8")) };
  } catch {
    return emptyFallback();
  }
}

function saveFallback(data) {
  if (!fs.existsSync(RUNTIME_ROOT)) fs.mkdirSync(RUNTIME_ROOT, { recursive: true });
  fs.writeFileSync(FALLBACK_PATH, JSON.stringify(data, null, 2));
}

function createJsonFallback() {
  function refreshPattern(data, actionType) {
    const tasks = data.task_log.filter(t => t.task_type === actionType);
    const successCount = tasks.filter(t => t.success).length;
    const existing = data.usage_patterns.find(p => p.action_type === actionType);
    const pattern = existing || { action_type: actionType, count: 0, last_used: now(), success_rate: 0 };
    pattern.count = tasks.length;
    pattern.last_used = now();
    pattern.success_rate = tasks.length ? successCount / tasks.length : 0;
    if (!existing) data.usage_patterns.push(pattern);
  }

  return {
    mode: "json_fallback",
    listMemories() {
      return loadFallback().memories.filter(m => m.approved).slice(0, 100);
    },
    addMemory(input) {
      if (hasSensitiveData(input.content) || hasSensitiveData(input.source)) {
        throw new Error("Sensitive data rejected.");
      }
      const data = loadFallback();
      const memory = {
        id: Date.now(),
        type: String(input.type || "learning").slice(0, 40),
        content: String(input.content || "").slice(0, 2000),
        source: String(input.source || "manual").slice(0, 80),
        importance: clampImportance(input.importance),
        created_at: now(),
        approved: input.approved ? 1 : 0
      };
      data.memories.unshift(memory);
      saveFallback(data);
      return memory;
    },
    listPatterns() {
      return loadFallback().usage_patterns;
    },
    logTask(input) {
      if (hasSensitiveData(input.prompt)) throw new Error("Sensitive data rejected.");
      const data = loadFallback();
      const task = {
        id: Date.now(),
        task_type: normalizeTaskType(input.task_type),
        prompt: String(input.prompt || "").slice(0, 200),
        success: input.success ? 1 : 0,
        provider: String(input.provider || "unknown").slice(0, 40),
        duration_ms: Math.max(0, Number(input.duration_ms) || 0),
        created_at: now()
      };
      data.task_log.unshift(task);
      refreshPattern(data, task.task_type);
      saveFallback(data);
      return task;
    },
    stats() {
      return buildStats(loadFallback().task_log);
    }
  };
}

function buildStats(rows) {
  const total = rows.length;
  const successCount = rows.filter(r => Number(r.success) === 1).length;
  const by_provider = {};
  const by_type = {};

  for (const row of rows) {
    const provider = row.provider || "unknown";
    const type = row.task_type || "chat";
    if (!by_provider[provider]) by_provider[provider] = { calls: 0, success: 0 };
    if (!by_type[type]) by_type[type] = { calls: 0, success: 0, total_duration_ms: 0 };
    by_provider[provider].calls += 1;
    by_provider[provider].success += Number(row.success) === 1 ? 1 : 0;
    by_type[type].calls += 1;
    by_type[type].success += Number(row.success) === 1 ? 1 : 0;
    by_type[type].total_duration_ms += Number(row.duration_ms) || 0;
  }

  for (const provider of Object.keys(by_provider)) {
    const p = by_provider[provider];
    p.success_rate = p.calls ? p.success / p.calls : 0;
    delete p.success;
  }

  for (const type of Object.keys(by_type)) {
    const t = by_type[type];
    t.success_rate = t.calls ? t.success / t.calls : 0;
    t.avg_duration_ms = t.calls ? Math.round(t.total_duration_ms / t.calls) : 0;
    delete t.success;
    delete t.total_duration_ms;
  }

  return {
    total_tasks: total,
    success_rate: total ? successCount / total : 0,
    by_provider,
    by_type
  };
}

function createSqliteDb() {
  const Database = require("better-sqlite3");
  if (!fs.existsSync(RUNTIME_ROOT)) fs.mkdirSync(RUNTIME_ROOT, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      importance INTEGER NOT NULL CHECK (importance BETWEEN 1 AND 10),
      created_at TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0 CHECK (approved IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS task_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_type TEXT NOT NULL,
      prompt TEXT NOT NULL,
      success INTEGER NOT NULL CHECK (success IN (0, 1)),
      provider TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usage_patterns (
      action_type TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      last_used TEXT NOT NULL,
      success_rate REAL NOT NULL DEFAULT 0
    );
  `);

  function updatePattern(actionType) {
    const stats = db.prepare(`
      SELECT COUNT(*) AS count, AVG(success) AS success_rate
      FROM task_log
      WHERE task_type = ?
    `).get(actionType);
    db.prepare(`
      INSERT INTO usage_patterns (action_type, count, last_used, success_rate)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(action_type) DO UPDATE SET
        count = excluded.count,
        last_used = excluded.last_used,
        success_rate = excluded.success_rate
    `).run(actionType, stats.count || 0, now(), Number(stats.success_rate) || 0);
  }

  return {
    mode: "sqlite",
    listMemories() {
      return db.prepare("SELECT * FROM memories WHERE approved = 1 ORDER BY created_at DESC LIMIT 100").all();
    },
    addMemory(input) {
      if (hasSensitiveData(input.content) || hasSensitiveData(input.source)) {
        throw new Error("Sensitive data rejected.");
      }
      const row = {
        type: String(input.type || "learning").slice(0, 40),
        content: String(input.content || "").slice(0, 2000),
        source: String(input.source || "manual").slice(0, 80),
        importance: clampImportance(input.importance),
        created_at: now(),
        approved: input.approved ? 1 : 0
      };
      const info = db.prepare(`
        INSERT INTO memories (type, content, source, importance, created_at, approved)
        VALUES (@type, @content, @source, @importance, @created_at, @approved)
      `).run(row);
      return { id: info.lastInsertRowid, ...row };
    },
    listPatterns() {
      return db.prepare("SELECT * FROM usage_patterns ORDER BY count DESC, last_used DESC").all();
    },
    logTask(input) {
      if (hasSensitiveData(input.prompt)) throw new Error("Sensitive data rejected.");
      const row = {
        task_type: normalizeTaskType(input.task_type),
        prompt: String(input.prompt || "").slice(0, 200),
        success: input.success ? 1 : 0,
        provider: String(input.provider || "unknown").slice(0, 40),
        duration_ms: Math.max(0, Number(input.duration_ms) || 0),
        created_at: now()
      };
      const info = db.prepare(`
        INSERT INTO task_log (task_type, prompt, success, provider, duration_ms, created_at)
        VALUES (@task_type, @prompt, @success, @provider, @duration_ms, @created_at)
      `).run(row);
      updatePattern(row.task_type);
      return { id: info.lastInsertRowid, ...row };
    },
    stats() {
      return buildStats(db.prepare("SELECT task_type, success, provider, duration_ms FROM task_log").all());
    }
  };
}

function createDb() {
  try {
    return createSqliteDb();
  } catch {
    return createJsonFallback();
  }
}

module.exports = { createDb, hasSensitiveData };
