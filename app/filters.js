// filters.js — kind, grade, search and earned filters for the tracker.
// The five kinds are story, missable, collectibles, activities and online.
// Online has no trophy in the official list yet; the filter stays, and
// shows an honest empty state instead of pretending otherwise.
import { KINDS } from './state.js';

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export function kindCounts(state) {
  const counts = { all: state.trophies.length };
  for (const kind of KINDS) counts[kind] = 0;
  for (const trophy of state.trophies) {
    if (trophy.missable) counts.missable += 1;
    for (const category of trophy.categories) {
      if (counts[category] !== undefined) counts[category] += 1;
    }
  }
  return counts;
}

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable;
  return trophy.categories.includes(kind);
}

export function matchesSearch(trophy, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${trophy.id} #${trophy.id} ${trophy.name} ${trophy.description} ${trophy.grade}`.toLowerCase();
  return haystack.includes(q);
}

export function applyFilters(state) {
  const { kind, grade, search, earnedOnly, hideEarned } = state.filters;
  return state.trophies.filter((trophy) => {
    if (!matchesKind(trophy, kind)) return false;
    if (grade !== 'all' && trophy.grade !== grade) return false;
    if (!matchesSearch(trophy, search)) return false;
    const earned = state.earned.has(trophy.id);
    if (earnedOnly && !earned) return false;
    if (hideEarned && earned) return false;
    return true;
  });
}
