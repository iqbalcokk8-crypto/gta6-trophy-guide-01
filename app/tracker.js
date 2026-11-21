// tracker.js — the 55-trophy checklist and every progress readout:
// the masthead counter, the dashboard grade bars, and the tracker rows.
// Rows show the official name, description and grade, the PSN count where
// the list has one, kind tags, and a Guide button that opens the guide pane.
import { gradeCounts, earnedGradeCounts, isEarned } from './state.js';
import { displayName, displayDescription } from './spoilers.js';
import { applyFilters } from './filters.js';

export function renderOverallProgress(state) {
  const earned = state.earned.size;
  const total = state.trophies.length;
  document.getElementById('earned-count').textContent = String(earned);
  document.getElementById('overall-fill').style.width = total ? `${(earned / total) * 100}%` : '0%';
  const totals = gradeCounts(state);
  const got = earnedGradeCounts(state);
  document.getElementById('overall-note').textContent =
    `Platinum ${got.platinum} of ${totals.platinum} · Gold ${got.gold} of ${totals.gold} · ` +
    `Silver ${got.silver} of ${totals.silver} · Bronze ${got.bronze} of ${totals.bronze}`;
}

export function renderDashboardProgress(state) {
  const earned = state.earned.size;
  const total = state.trophies.length;
  document.getElementById('dash-earned').textContent = String(earned);
  document.getElementById('dash-remaining').textContent = String(total - earned);

  const totals = gradeCounts(state);
  const got = earnedGradeCounts(state);
  const host = document.getElementById('grade-bars');
  host.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const row = document.createElement('div');
    row.className = 'grade-bar-row';
    const label = document.createElement('span');
    label.textContent = grade[0].toUpperCase() + grade.slice(1);
    const track = document.createElement('div');
    track.className = 'track';
    const fill = document.createElement('div');
    fill.className = `fill ${grade}`;
    fill.style.width = totals[grade] ? `${(got[grade] / totals[grade]) * 100}%` : '0%';
    track.append(fill);
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `${got[grade]} / ${totals[grade]}`;
    row.append(label, track, count);
    host.append(row);
  }
}

function gradeBadge(grade) {
  const badge = document.createElement('span');
  badge.className = `grade-badge ${grade}`;
  badge.textContent = grade;
  return badge;
}

function kindTag(text, extraClass) {
  const tag = document.createElement('span');
  tag.className = `kind-tag${extraClass ? ` ${extraClass}` : ''}`;
  tag.textContent = text;
  return tag;
}

export function renderTrophyList(state, onToggle, onOpenGuide) {
  const list = document.getElementById('trophy-list');
  const visible = applyFilters(state);
  list.replaceChildren();
  for (const trophy of visible) {
    const earned = isEarned(state, trophy);
    const item = document.createElement('li');
    item.className = `trophy-row${earned ? ' is-earned' : ''}`;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Earned: ${displayName(state, trophy)}`);
    box.addEventListener('change', () => onToggle(trophy.id, box.checked));
    box.addEventListener('click', (event) => event.stopPropagation());

    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = `#${trophy.id} · ${displayName(state, trophy)}`;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(state, trophy);
    if (displayDescription(state, trophy).startsWith('Spoiler') || displayDescription(state, trophy).startsWith('Hidden')) {
      desc.classList.add('spoiler-mask');
    }
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(gradeBadge(trophy.grade));
    for (const category of trophy.categories) meta.append(kindTag(category));
    if (trophy.hidden) meta.append(kindTag('Hidden', 'hidden-tag'));
    if (trophy.missable) meta.append(kindTag('Missable', 'missable'));
    if (trophy.count !== null) {
      const count = document.createElement('span');
      count.className = 'trophy-count';
      count.textContent = `PSN target: ${trophy.count.toLocaleString('en-US')}`;
      meta.append(count);
    }
    body.append(name, desc, meta);

    const guideButton = document.createElement('button');
    guideButton.type = 'button';
    guideButton.className = 'open-guide';
    guideButton.textContent = 'Guide →';
    guideButton.addEventListener('click', (event) => {
      event.stopPropagation();
      onOpenGuide(trophy.id);
    });

    item.addEventListener('click', () => onOpenGuide(trophy.id));
    item.append(box, body, guideButton);
    list.append(item);
  }

  const countLine = document.getElementById('tracker-count');
  countLine.textContent = `Showing ${visible.length} of ${state.trophies.length} trophies · ${state.earned.size} earned overall`;
  const emptyNote = document.getElementById('tracker-empty');
  emptyNote.hidden = visible.length !== 0;
  if (visible.length === 0) {
    // Online is a real filter with a real answer: the official list holds no
    // online trophy. Say so plainly instead of borrowing partner trophies.
    emptyNote.textContent = state.filters.kind === 'online'
      ? 'Tidak ada trofi online — semua 55 trofi single-player/offline.'
      : 'No trophies match these filters. Clear the search or pick another kind.';
  }
}
