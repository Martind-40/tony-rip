import fs from "node:fs/promises";
import path from "node:path";
import { classifySensitivity } from "./sensitivityClassifier.js";
import { distillKnowledge, redactSensitiveText } from "./knowledgeDistiller.js";

const ROOT = "/Users/macbook/ultron";
const MEMORY_ROOT = path.join(ROOT, "memory");
const BLOCKED_FILE_NAMES = new Set([".env", ".env.local", ".env.production"]);
const BLOCKED_PATTERNS = /(api[_-]?key|token|secret|password|private[_-]?key|-----BEGIN)/i;

const PATHS = {
  raw: path.join(MEMORY_ROOT, "raw_input"),
  classified: path.join(MEMORY_ROOT, "classified"),
  distilled: path.join(MEMORY_ROOT, "distilled_knowledge"),
  tasks: path.join(MEMORY_ROOT, "tasks"),
  atoms: path.join(MEMORY_ROOT, "learning_atoms.json"),
  index: path.join(MEMORY_ROOT, "knowledge_index.json")
};

function assertAllowedPath(targetPath) {
  const resolved = path.resolve(targetPath);
  const allowed = Object.values(PATHS).some((allowedPath) => {
    const allowedResolved = path.resolve(allowedPath);
    return resolved === allowedResolved || resolved.startsWith(`${allowedResolved}${path.sep}`);
  });

  if (!allowed || BLOCKED_FILE_NAMES.has(path.basename(resolved))) {
    throw new Error(`Blocked memory write path: ${targetPath}`);
  }

  return resolved;
}

function assertNoCredentials(text) {
  if (BLOCKED_PATTERNS.test(String(text || ""))) {
    throw new Error("Blocked memory write: possible credential or secret detected.");
  }
}

async function readJson(filePath, fallback) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  const resolved = assertAllowedPath(filePath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function updateIndex(index, atoms) {
  const next = {
    version: index.version || "1.0.0",
    status: "active",
    projects: index.projects || {},
    categories: index.categories || {},
    topics: index.topics || {},
    atoms: index.atoms || []
  };

  for (const atom of atoms) {
    next.projects[atom.project] = unique([...(next.projects[atom.project] || []), atom.id]);
    next.categories[atom.category] = unique([...(next.categories[atom.category] || []), atom.id]);
    next.topics[atom.topic] = unique([...(next.topics[atom.topic] || []), atom.id]);
    next.atoms = unique([...next.atoms, atom.id]);
  }

  next.updated_at = new Date().toISOString();
  return next;
}

export async function writeLearningMemory(text, options = {}) {
  const classification = options.classification || classifySensitivity(text);
  const distilled = distillKnowledge(text, { ...options, classification });
  const safePreview = redactSensitiveText(text);
  const storesRaw = distilled.raw_input_retention === "ALLOWED_LOCAL_ONLY";

  assertNoCredentials(safePreview);

  const timestamp = options.created_at || new Date().toISOString();
  const stamp = timestamp.replace(/[:.]/g, "-");
  const project = options.project || "ultron";
  const topic = options.topic || "learning-layer";

  await fs.mkdir(PATHS.raw, { recursive: true });
  await fs.mkdir(PATHS.classified, { recursive: true });
  await fs.mkdir(PATHS.distilled, { recursive: true });
  await fs.mkdir(PATHS.tasks, { recursive: true });

  if (storesRaw) {
    await fs.writeFile(assertAllowedPath(path.join(PATHS.raw, `${stamp}-${project}.txt`)), safePreview, "utf8");
  }

  await writeJson(path.join(PATHS.classified, `${stamp}-${project}.json`), {
    project,
    topic,
    classification,
    redacted_preview: safePreview.slice(0, 1000),
    created_at: timestamp
  });

  await writeJson(path.join(PATHS.distilled, `${stamp}-${project}.json`), distilled);

  if (distilled.distilled.tasks.length > 0) {
    await writeJson(path.join(PATHS.tasks, `${stamp}-${project}.json`), {
      project,
      topic,
      tasks: distilled.distilled.tasks,
      created_at: timestamp
    });
  }

  const learningAtoms = await readJson(PATHS.atoms, { version: "1.0.0", status: "initialized", atoms: [] });
  learningAtoms.status = "active";
  learningAtoms.updated_at = timestamp;
  learningAtoms.atoms = [...(learningAtoms.atoms || []), ...distilled.atoms];
  await writeJson(PATHS.atoms, learningAtoms);

  const knowledgeIndex = await readJson(PATHS.index, {
    version: "1.0.0",
    status: "initialized",
    projects: {},
    categories: {},
    topics: {},
    atoms: []
  });
  await writeJson(PATHS.index, updateIndex(knowledgeIndex, distilled.atoms));

  return {
    status: "WRITTEN",
    raw_input_written: storesRaw,
    atoms_written: distilled.atoms.length,
    classification
  };
}

