// spoilers.js — the spoiler shield for VICE CITY — PLATINUM OPERATIONS.
// Default ON. A story trophy's name and description stay hidden until it is
// earned. A trophy PlayStation itself flags hidden stays masked until earned
// no matter what the shield switch says. Grades, counts and kind tags are
// never hidden — only the words that spoil the story.
export function isStoryTrophy(trophy) {
  return trophy.categories.includes('story');
}

export function isSpoilerMasked(state, trophy) {
  if (state.earned.has(trophy.id)) return false;
  if (trophy.hidden) return true;
  return state.spoilerShield && isStoryTrophy(trophy);
}

export function displayName(state, trophy) {
  if (!isSpoilerMasked(state, trophy)) return trophy.name;
  if (trophy.hidden && !isStoryTrophy(trophy)) {
    // A hidden non-story trophy stays masked, but the bare "#46" label
    // reads like a placeholder — name its kind instead (Activity,
    // Collectible, …), which says what sort of trophy it is without
    // revealing its name or description.
    const kind = (trophy.categories[0] || '').toLowerCase();
    const kindLabel = kind === 'activities' ? 'Activity'
      : kind === 'collectibles' ? 'Collectible'
      : kind === 'story' ? 'Story'
      : kind ? kind[0].toUpperCase() + kind.slice(1) : '';
    return kindLabel ? `Hidden Trophy #${trophy.id} · ${kindLabel}` : `Hidden Trophy #${trophy.id}`;
  }
  return `Hidden Story Trophy #${trophy.id}`;
}

export function displayDescription(state, trophy) {
  if (!isSpoilerMasked(state, trophy)) return trophy.description;
  if (trophy.hidden) {
    return 'Hidden on PlayStation until earned — its name and description stay masked here too.';
  }
  return 'Spoiler shield is on — this story trophy’s name and description stay hidden until you earn it.';
}

export function isGuideMasked(state, trophy) {
  // The guide itself is story too: it stays behind the shield until earned.
  return isSpoilerMasked(state, trophy);
}

export function spoilerSummary(state) {
  return state.spoilerShield ? 'ON' : 'OFF';
}
