// guides.js — the guide pane: one trophy's guide in our own words, its
// steps and tips, and its evidence BESIDE the guide (never a bibliography
// at the bottom): each source names its publisher and title, links to the
// page, and lists the claim ids it supports. A source is cited, never copied.
import { getTrophy, isEarned } from './state.js';
import { displayName, displayDescription, isGuideMasked } from './spoilers.js';

function sourceLink(source) {
  const item = document.createElement('li');
  const publisher = document.createElement('strong');
  publisher.textContent = source.publisher || 'Source';
  item.append(publisher, document.createTextNode(' — '));
  if (source.url) {
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = source.title || source.url;
    item.append(link);
  } else {
    item.append(document.createTextNode(source.title || 'Untitled source'));
  }
  if (Array.isArray(source.supports) && source.supports.length > 0) {
    const supports = document.createElement('div');
    supports.className = 'supports';
    supports.textContent = `Supports: ${source.supports.join(', ')}`;
    item.append(supports);
  }
  return item;
}

export function renderGuidePane(state, trophyId) {
  const pane = document.getElementById('guide-pane');
  const trophy = getTrophy(state, trophyId);
  pane.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'guide-empty';
    empty.textContent = 'Pick a trophy to read its guide.';
    pane.append(empty);
    return;
  }

  const title = document.createElement('h2');
  title.textContent = `#${trophy.id} · ${displayName(state, trophy)}`;
  const desc = document.createElement('p');
  desc.className = 'official-desc';
  desc.textContent = `Official: “${displayDescription(state, trophy)}”`;
  const badges = document.createElement('div');
  badges.className = 'trophy-meta';
  const grade = document.createElement('span');
  grade.className = `grade-badge ${trophy.grade}`;
  grade.textContent = trophy.grade;
  badges.append(grade);
  if (trophy.hidden) {
    const hidden = document.createElement('span');
    hidden.className = 'kind-tag hidden-tag';
    hidden.textContent = 'Hidden';
    badges.append(hidden);
  }
  if (trophy.count !== null) {
    const count = document.createElement('span');
    count.className = 'trophy-count';
    count.textContent = `PSN target: ${trophy.count.toLocaleString('en-US')}`;
    badges.append(count);
  }
  const earned = document.createElement('span');
  earned.className = 'kind-tag';
  earned.textContent = isEarned(state, trophy) ? 'Earned ✓' : 'Not earned yet';
  badges.append(earned);

  pane.append(title, desc, badges);

  if (isGuideMasked(state, trophy)) {
    const masked = document.createElement('p');
    masked.className = 'spoiler-mask';
    masked.textContent = 'This guide is behind the spoiler shield — earn the trophy, or turn the shield off in Backup & Settings, to read it.';
    pane.append(masked);
    return;
  }

  if (trophy.missable && trophy.missable_window) {
    const banner = document.createElement('div');
    banner.className = 'missable-banner';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — ';
    banner.append(strong, document.createTextNode(trophy.missable_window));
    pane.append(banner);
  }

  const body = document.createElement('div');
  body.className = 'guide-body';
  const left = document.createElement('div');
  const guideText = document.createElement('p');
  guideText.textContent = trophy.guide || 'Guide coming soon.';
  left.append(guideText);

  if (trophy.steps.length > 0) {
    const stepsTitle = document.createElement('p');
    stepsTitle.className = 'guide-section-title';
    stepsTitle.textContent = 'Steps';
    const steps = document.createElement('ol');
    steps.className = 'guide-steps';
    for (const step of trophy.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      steps.append(li);
    }
    left.append(stepsTitle, steps);
  }
  if (trophy.tips.length > 0) {
    const tipsTitle = document.createElement('p');
    tipsTitle.className = 'guide-section-title';
    tipsTitle.textContent = 'Tips';
    const tips = document.createElement('ul');
    tips.className = 'guide-tips';
    for (const tip of trophy.tips) {
      const li = document.createElement('li');
      li.textContent = tip;
      tips.append(li);
    }
    left.append(tipsTitle, tips);
  }
  if (trophy.notes) {
    const notesTitle = document.createElement('p');
    notesTitle.className = 'guide-section-title';
    notesTitle.textContent = 'Catatan';
    const notesText = document.createElement('p');
    notesText.className = 'guide-notes';
    notesText.textContent = trophy.notes;
    left.append(notesTitle, notesText);
  }

  const evidence = document.createElement('aside');
  evidence.className = 'evidence';
  const evidenceTitle = document.createElement('h3');
  evidenceTitle.textContent = 'Evidence — where each fact comes from';
  evidence.append(evidenceTitle);
  if (trophy.sources.length > 0) {
    const list = document.createElement('ul');
    for (const source of trophy.sources) list.append(sourceLink(source));
    evidence.append(list);
  } else {
    const pending = document.createElement('p');
    pending.className = 'muted';
    pending.textContent = 'No verified source is cited for this guide yet. The content pass cites a real, opened source for every claim before this guide is finished — an uncited step earns no credit, so none is claimed here.';
    evidence.append(pending);
  }
  body.append(left, evidence);
  pane.append(body);
}

export function buildGuideOptions(state) {
  const select = document.getElementById('guide-select');
  select.replaceChildren();
  for (const trophy of state.trophies) {
    const option = document.createElement('option');
    option.value = String(trophy.id);
    option.textContent = `#${trophy.id} · ${displayName(state, trophy)}`;
    select.append(option);
  }
  select.value = String(state.selectedId);
}

export function stepSelectedId(state, direction) {
  const ids = state.trophies.map((t) => t.id);
  const index = ids.indexOf(state.selectedId);
  const next = ids[(index + direction + ids.length) % ids.length];
  state.selectedId = next;
  return next;
}
