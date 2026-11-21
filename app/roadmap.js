// roadmap.js — the platinum roadmap: five phases built from the official
// descriptions, per-phase progress, the missable alerts, and the Next up list
// (the next unearned trophies in roadmap order).
import { getTrophy, isEarned, missableTrophies, trophiesInRoadmapOrder, hiddenCount } from './state.js';
import { displayName } from './spoilers.js';

export function renderHiddenCard(state) {
  document.getElementById('hidden-count').textContent = String(hiddenCount(state));
  document.getElementById('spoiler-state').textContent = state.spoilerShield ? 'ON' : 'OFF';
}

export function renderRoadmapStatus(state) {
  const host = document.getElementById('roadmap-status');
  host.replaceChildren();
  for (const phase of state.phases) {
    const ids = phase.trophies || [];
    const done = ids.filter((id) => state.earned.has(id)).length;
    const line = document.createElement('p');
    line.className = 'stat-line';
    const strong = document.createElement('strong');
    strong.textContent = `${done}/${ids.length}`;
    line.append(strong, document.createTextNode(` — ${phase.title}`));
    host.append(line);
  }
}

export function renderMissableAlerts(state) {
  const host = document.getElementById('missable-alerts');
  host.replaceChildren();
  const missable = missableTrophies(state);
  if (missable.length === 0) {
    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = 'No missable window is verified yet. A window is only flagged here when a source proves it — nothing is assumed, so nothing here can send you down the wrong path. The content pass is verifying every trophy against real sources.';
    host.append(note);
    return;
  }
  for (const trophy of missable) {
    const item = document.createElement('div');
    item.className = 'missable-item';
    const title = document.createElement('div');
    title.textContent = `#${trophy.id} · ${displayName(state, trophy)}`;
    const window = document.createElement('div');
    window.className = 'window';
    window.textContent = trophy.missable_window || 'Missable — window not yet specified.';
    item.append(title, window);
    host.append(item);
  }
}

export function renderNextUp(state, onOpenGuide) {
  const host = document.getElementById('next-up');
  host.replaceChildren();
  const next = trophiesInRoadmapOrder(state).filter((t) => !isEarned(state, t)).slice(0, 5);
  if (next.length === 0) {
    const done = document.createElement('p');
    done.textContent = 'Every trophy is earned. Vice Got a Price! — you are a Leonida Legend.';
    host.append(done);
    return;
  }
  for (const trophy of next) {
    const row = document.createElement('div');
    row.className = 'next-up-item';
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = `#${trophy.id}`;
    const name = document.createElement('span');
    name.textContent = displayName(state, trophy);
    const grade = document.createElement('span');
    grade.className = `grade-badge ${trophy.grade}`;
    grade.textContent = trophy.grade;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'open-guide';
    button.textContent = 'Guide →';
    button.addEventListener('click', () => onOpenGuide(trophy.id));
    row.append(num, name, grade, button);
    host.append(row);
  }
}

export function renderRoadmapPhases(state, onOpenGuide) {
  const host = document.getElementById('roadmap-phases');
  host.replaceChildren();
  for (const phase of state.phases) {
    const section = document.createElement('section');
    section.className = 'phase';
    const head = document.createElement('div');
    head.className = 'phase-head';
    const title = document.createElement('h3');
    title.textContent = phase.title;
    const ids = phase.trophies || [];
    const done = ids.filter((id) => state.earned.has(id)).length;
    const progress = document.createElement('span');
    progress.className = 'phase-progress';
    progress.textContent = `${done} of ${ids.length} earned`;
    head.append(title, progress);

    const notes = document.createElement('p');
    notes.className = 'notes';
    notes.textContent = phase.summary || '';

    const chips = document.createElement('div');
    chips.className = 'phase-trophies';
    for (const id of ids) {
      const trophy = getTrophy(state, id);
      if (!trophy) continue;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `phase-chip${isEarned(state, trophy) ? ' is-earned' : ''}`;
      chip.textContent = `#${id} ${displayName(state, trophy)}`;
      chip.addEventListener('click', () => onOpenGuide(id));
      chips.append(chip);
    }

    section.append(head, notes, chips);
    const phaseMissable = (phase.missable || [])
      .map((id) => getTrophy(state, id))
      .filter(Boolean);
    if (phaseMissable.length > 0) {
      const alert = document.createElement('p');
      alert.className = 'missable-note';
      alert.textContent = `Missable in this phase: ${phaseMissable.map((t) => `#${t.id} ${displayName(state, t)}`).join(' · ')}`;
      section.append(alert);
    }
    if (phase.missable_notes) {
      const missableNote = document.createElement('p');
      missableNote.className = 'missable-note';
      missableNote.textContent = phase.missable_notes;
      section.append(missableNote);
    }
    host.append(section);
  }
}
