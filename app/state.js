// state.js — the single source of truth for VICE CITY — PLATINUM OPERATIONS.
// Loads the local data files (trophies.json required; sources.json and
// roadmap.json optional — the app keeps working when either is missing),
// normalises every trophy to the full schema, and holds the live UI state:
// earned ticks, filters, the spoiler shield, and the selected trophy.
import { loadProgress } from './storage.js';

export const KINDS = ['story', 'missable', 'collectibles', 'activities', 'online'];
export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

export function createEmptyState() {
  return {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    trophies: [],
    byId: new Map(),
    sourcesRegistry: [],
    referenceMatrix: null,
    phases: [],
    earned: new Set(),
    spoilerShield: true,
    filters: { kind: 'all', grade: 'all', search: '', earnedOnly: false, hideEarned: false },
    selectedId: 1,
    view: 'dashboard',
  };
}

function normaliseTrophy(raw) {
  const categories = Array.isArray(raw.categories) ? raw.categories : [];
  return {
    id: raw.id,
    name: typeof raw.name === 'string' ? raw.name : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    grade: typeof raw.grade === 'string' ? raw.grade : 'bronze',
    hidden: raw.hidden === true,
    count: typeof raw.count === 'number' ? raw.count : null,
    categories,
    missable: raw.missable === true,
    missable_window: typeof raw.missable_window === 'string' ? raw.missable_window : null,
    guide: typeof raw.guide === 'string' ? raw.guide : '',
    steps: Array.isArray(raw.steps) ? raw.steps : [],
    tips: Array.isArray(raw.tips) ? raw.tips : [],
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    notes: typeof raw.notes === 'string' && raw.notes.trim().length > 0 ? raw.notes : null,
  };
}

async function fetchJsonOrNull(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function loadGameData() {
  const state = createEmptyState();
  const doc = await fetchJsonOrNull('data/trophies.json');
  if (!doc || !Array.isArray(doc.trophies)) {
    throw new Error('data/trophies.json is missing or has no trophies array');
  }
  state.game = doc.game || state.game;
  state.platform = doc.platform || state.platform;
  state.trophies = doc.trophies.map(normaliseTrophy);
  state.trophies.sort((a, b) => a.id - b.id);
  for (const trophy of state.trophies) state.byId.set(trophy.id, trophy);

  const sourcesDoc = await fetchJsonOrNull('data/sources.json');
  if (sourcesDoc && Array.isArray(sourcesDoc.sources)) {
    state.sourcesRegistry = sourcesDoc.sources;
  }
  if (sourcesDoc && sourcesDoc.matrix) {
    state.referenceMatrix = sourcesDoc.matrix;
  }

  const roadmapDoc = await fetchJsonOrNull('data/roadmap.json');
  if (roadmapDoc && Array.isArray(roadmapDoc.phases)) {
    state.phases = roadmapDoc.phases;
  } else {
    // Degrade gracefully: one phase holding every trophy, in id order.
    state.phases = [{
      id: 'phase-all',
      title: 'All trophies',
      notes: 'Roadmap data is not loaded yet.',
      trophies: state.trophies.map((t) => t.id),
      missable: [],
    }];
  }

  const saved = loadProgress();
  if (saved) {
    state.earned = new Set(saved.earned.filter((id) => state.byId.has(id)));
    if (typeof saved.spoilerShield === 'boolean') state.spoilerShield = saved.spoilerShield;
  }
  return state;
}

export function getTrophy(state, id) {
  return state.byId.get(id);
}

export function isEarned(state, trophy) {
  return state.earned.has(trophy.id);
}

export function earnedCount(state) {
  return state.earned.size;
}

export function gradeCounts(state) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of state.trophies) {
    if (counts[trophy.grade] !== undefined) counts[trophy.grade] += 1;
  }
  return counts;
}

export function earnedGradeCounts(state) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const id of state.earned) {
    const trophy = state.byId.get(id);
    if (trophy && counts[trophy.grade] !== undefined) counts[trophy.grade] += 1;
  }
  return counts;
}

export function hiddenCount(state) {
  return state.trophies.filter((t) => t.hidden).length;
}

export function missableTrophies(state) {
  return state.trophies.filter((t) => t.missable);
}

export function trophiesInRoadmapOrder(state) {
  const ordered = [];
  const seen = new Set();
  for (const phase of state.phases) {
    for (const id of phase.trophies || []) {
      const trophy = state.byId.get(id);
      if (trophy && !seen.has(id)) {
        seen.add(id);
        ordered.push(trophy);
      }
    }
  }
  for (const trophy of state.trophies) {
    if (!seen.has(trophy.id)) ordered.push(trophy);
  }
  return ordered;
}
