import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/macbook/ultron";
const MEMORY_ROOT = path.join(ROOT, "memory");
const ATOMS_PATH = path.join(MEMORY_ROOT, "learning_atoms.json");
const INDEX_PATH = path.join(MEMORY_ROOT, "knowledge_index.json");

async function readJson(filePath, fallback) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function readKnowledgeIndex() {
  return readJson(INDEX_PATH, {
    version: "1.0.0",
    status: "missing",
    projects: {},
    categories: {},
    topics: {},
    atoms: []
  });
}

export async function readLearningAtoms() {
  return readJson(ATOMS_PATH, {
    version: "1.0.0",
    status: "missing",
    atoms: []
  });
}

export async function searchMemory({ project, category, topic, query } = {}) {
  const atomStore = await readLearningAtoms();
  const normalizedQuery = String(query || "").toLowerCase();

  return (atomStore.atoms || []).filter((atom) => {
    const projectMatches = !project || atom.project === project;
    const categoryMatches = !category || atom.category === category || atom.source_category === category;
    const topicMatches = !topic || atom.topic === topic || (atom.tags || []).includes(topic);
    const queryMatches =
      !normalizedQuery ||
      [atom.summary, atom.reusable_lesson, atom.topic, atom.project, ...(atom.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return projectMatches && categoryMatches && topicMatches && queryMatches;
  });
}

export async function prepareRagSeed(filters = {}) {
  const matches = await searchMemory(filters);
  return matches.map((atom) => ({
    id: atom.id,
    text: `${atom.summary}\n${atom.reusable_lesson}`.trim(),
    metadata: {
      project: atom.project,
      topic: atom.topic,
      category: atom.category,
      tags: atom.tags || [],
      created_at: atom.created_at
    }
  }));
}

