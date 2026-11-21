// backup.js — export / import / reset wiring for Backup & Settings.
// Export downloads a JSON backup. Import reads the file, validates its
// schema against the live trophy list, and only then asks for confirmation
// before replacing the saved progress. Reset also asks first.
import { downloadExport, validateImportFile, applyImport, clearProgress, saveProgress } from './storage.js';

export function wireBackup(state, rerender) {
  const status = document.getElementById('import-status');
  const setStatus = (message, ok) => {
    status.textContent = message;
    status.className = `import-status${ok === true ? ' ok' : ok === false ? ' bad' : ''}`;
  };

  document.getElementById('export-button').addEventListener('click', () => {
    const count = downloadExport(state);
    setStatus(`Exported ${count} earned trophy/trophies to vice-city-platinum-progress.json.`, true);
  });

  document.getElementById('import-input').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    let text;
    try {
      text = await file.text();
    } catch {
      setStatus('Could not read that file.', false);
      return;
    }
    const knownIds = new Set(state.trophies.map((t) => t.id));
    const result = validateImportFile(text, knownIds);
    if (!result.ok) {
      setStatus(`Import refused: ${result.error}`, false);
      return;
    }
    const replace = window.confirm(
      `Import ${result.data.earned.length} earned trophy/trophies from "${file.name}"? ` +
      'This replaces the progress saved in this browser.',
    );
    if (!replace) {
      setStatus('Import cancelled — your saved progress is unchanged.', undefined);
      return;
    }
    applyImport(state, result);
    setStatus(`Imported ${result.data.earned.length} earned trophy/trophies.`, true);
    rerender();
  });

  document.getElementById('reset-button').addEventListener('click', () => {
    const sure = window.confirm(
      'Reset ALL progress? Every earned tick in this browser will be cleared. Export a backup first if you want to keep it.',
    );
    if (!sure) return;
    clearProgress(state);
    setStatus('Progress reset — 0 of 55 earned.', true);
    rerender();
  });
}

export function wireSpoilerToggle(state, rerender) {
  const toggle = document.getElementById('spoiler-toggle');
  toggle.checked = state.spoilerShield;
  toggle.addEventListener('change', () => {
    state.spoilerShield = toggle.checked;
    saveProgress(state);
    rerender();
  });
}
