// app.js — boot and navigation for VICE CITY — PLATINUM OPERATIONS.
// Loads the local data files, restores saved progress, wires the tabs,
// the tracker filters, the guide picker and the backup panel, then renders
// every view. Fully offline: the only fetches are the app's own JSON files.
import { loadGameData, createEmptyState } from './state.js';
import { saveProgress } from './storage.js';
import { renderOverallProgress, renderDashboardProgress, renderTrophyList } from './tracker.js';
import { renderHiddenCard, renderRoadmapStatus, renderMissableAlerts, renderNextUp, renderRoadmapPhases } from './roadmap.js';
import { renderGuidePane, buildGuideOptions, stepSelectedId } from './guides.js';
import { wireBackup, wireSpoilerToggle } from './backup.js';
import { renderAuditStrip } from './audit.js';
import { renderReferenceMatrix } from './matrix.js';

let state;
let dataError = null;
try {
  state = await loadGameData();
} catch (error) {
  // Degrade gracefully: the shell still loads and says plainly that the
  // trophy data is not here yet, instead of a blank page. The content pass
  // owns data/trophies.json; the UI waits for it.
  dataError = error;
  state = createEmptyState();
}

function showView(name) {
  state.view = name;
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('is-visible', section.id === `view-${name}`);
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === name);
  }
}

function openGuide(id) {
  state.selectedId = id;
  document.getElementById('guide-select').value = String(id);
  renderGuidePane(state, id);
  showView('guide');
}

function renderAll() {
  renderOverallProgress(state);
  renderDashboardProgress(state);
  renderHiddenCard(state);
  renderRoadmapStatus(state);
  renderMissableAlerts(state);
  renderNextUp(state, openGuide);
  renderTrophyList(
    state,
    (id, checked) => {
      if (checked) state.earned.add(id);
      else state.earned.delete(id);
      saveProgress(state);
      renderAll();
    },
    openGuide,
  );
  renderRoadmapPhases(state, openGuide);
  buildGuideOptions(state);
  renderGuidePane(state, state.selectedId);
  renderAuditStrip(state);
  renderReferenceMatrix(state);
  document.getElementById('spoiler-toggle').checked = state.spoilerShield;
}

function wireNavigation() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }
}

function wireFilters() {
  document.getElementById('search-input').addEventListener('input', (event) => {
    state.filters.search = event.target.value;
    renderTrophyList(state, toggleEarned, openGuide);
    refreshTrackerCountOnly();
  });
  document.querySelectorAll('input[name="kind"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.filters.kind = radio.value;
      renderTrophyList(state, toggleEarned, openGuide);
    });
  });
  document.getElementById('grade-select').addEventListener('change', (event) => {
    state.filters.grade = event.target.value;
    renderTrophyList(state, toggleEarned, openGuide);
  });
  document.getElementById('earned-only').addEventListener('change', (event) => {
    state.filters.earnedOnly = event.target.checked;
    renderTrophyList(state, toggleEarned, openGuide);
  });
  document.getElementById('hide-earned').addEventListener('change', (event) => {
    state.filters.hideEarned = event.target.checked;
    renderTrophyList(state, toggleEarned, openGuide);
  });
}

function toggleEarned(id, checked) {
  if (checked) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress(state);
  renderAll();
}

function refreshTrackerCountOnly() {
  // renderTrophyList already updates the count line; nothing extra to do.
}

function wireGuidePicker() {
  document.getElementById('guide-select').addEventListener('change', (event) => {
    state.selectedId = Number(event.target.value);
    renderGuidePane(state, state.selectedId);
  });
  document.getElementById('guide-prev').addEventListener('click', () => {
    const id = stepSelectedId(state, -1);
    document.getElementById('guide-select').value = String(id);
    renderGuidePane(state, id);
  });
  document.getElementById('guide-next').addEventListener('click', () => {
    const id = stepSelectedId(state, 1);
    document.getElementById('guide-select').value = String(id);
    renderGuidePane(state, id);
  });
}

wireNavigation();
wireFilters();
wireGuidePicker();
wireBackup(state, renderAll);
wireSpoilerToggle(state, renderAll);
renderAll();
if (dataError) {
  const notice = document.getElementById('data-notice');
  notice.hidden = false;
  notice.textContent = 'Trophy data is not loaded yet — data/trophies.json is missing or unreadable. The guide shell is ready; the checklist, roadmap and guides appear as soon as the data file lands.';
}
