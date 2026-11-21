// storage.js — localStorage persistence plus export / import for
// VICE CITY — PLATINUM OPERATIONS. Progress lives in this browser only.
// Import never overwrites anything until the file passes schema validation
// AND the reader confirms the replace.
export const STORAGE_KEY = 'vice-city-platinum-operations:v1';
export const APP_ID = 'vice-city-platinum-operations';
export const BACKUP_VERSION = 1;

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return null;
    return {
      earned: parsed.earned.filter((id) => Number.isInteger(id)),
      spoilerShield: parsed.spoilerShield,
    };
  } catch {
    return null;
  }
}

export function saveProgress(state) {
  const payload = {
    app: APP_ID,
    version: BACKUP_VERSION,
    earned: [...state.earned].sort((a, b) => a - b),
    spoilerShield: state.spoilerShield,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function buildExport(state) {
  const payload = saveProgress(state);
  return {
    ...payload,
    exportedAt: new Date().toISOString(),
  };
}

export function downloadExport(state) {
  const data = buildExport(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'vice-city-platinum-progress.json';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return data.earned.length;
}

// validateImportFile parses + validates an imported backup against the live
// trophy list. Returns { ok: true, data } or { ok: false, error }.
// It never touches live state: the caller confirms before applying.
export function validateImportFile(text, knownIds) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'That file is not a progress backup (expected a JSON object).' };
  }
  if (!Array.isArray(parsed.earned)) {
    return { ok: false, error: 'That file has no "earned" list of trophy ids.' };
  }
  const unknown = parsed.earned.filter((id) => !knownIds.has(id));
  if (unknown.length > 0) {
    return { ok: false, error: `That file names ${unknown.length} unknown trophy id(s) (first: ${unknown[0]}). It was not made for this guide.` };
  }
  if (parsed.app && parsed.app !== APP_ID) {
    return { ok: false, error: `That file is for a different app ("${parsed.app}"), not this guide.` };
  }
  const earned = [...new Set(parsed.earned.filter((id) => Number.isInteger(id)))];
  return {
    ok: true,
    data: {
      earned,
      spoilerShield: typeof parsed.spoilerShield === 'boolean' ? parsed.spoilerShield : undefined,
    },
  };
}

export function applyImport(state, validated) {
  state.earned = new Set(validated.data.earned);
  if (typeof validated.data.spoilerShield === 'boolean') {
    state.spoilerShield = validated.data.spoilerShield;
  }
  saveProgress(state);
}

export function clearProgress(state) {
  state.earned = new Set();
  saveProgress(state);
}
