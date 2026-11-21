// matrix.js — the 55-trophy × sources reference matrix, shown as a
// collapsible table under the audit strip on the Command Center.
// Every cell comes from data/sources.json: the registry's trophy_ids
// (the source lists this trophy), method_ids (the source's walkthrough
// gives the unlock method) and reported_ids (a method reported by this
// source only — not confirmed by a second guide). A cell is marked
// "method" only when the source is actually cited for that trophy's
// unlock method; nothing here is inferred from a search snippet.
// Row labels use displayName(), so a hidden trophy stays masked here
// exactly as it does everywhere else — only its number and kind show.
import { getTrophy } from './state.js';
import { displayName } from './spoilers.js';

function columnLabel(source) {
  return source.short ? `${source.publisher} — ${source.short}` : source.publisher;
}

export function renderReferenceMatrix(state) {
  const host = document.getElementById('reference-matrix');
  const wasOpen = host.querySelector('details')?.open === true;
  host.replaceChildren();
  const matrix = state.referenceMatrix;
  if (!matrix || !Array.isArray(matrix.rows) || matrix.rows.length === 0) return;
  const sources = new Map(state.sourcesRegistry.map((s) => [s.id, s]));
  const columns = (matrix.columns || []).filter((id) => sources.has(id));
  if (columns.length === 0) return;

  let withMethod = 0;
  const reportedOnly = [];
  for (const row of matrix.rows) {
    const values = Object.values(row.cells || {});
    if (values.includes('method')) withMethod += 1;
    else if (values.includes('reported')) reportedOnly.push(row.id);
  }

  const details = document.createElement('details');
  details.className = 'reference-matrix';
  details.open = wasOpen;
  const summary = document.createElement('summary');
  summary.textContent = `Reference matrix — 55 trophies × ${columns.length} sources · ${withMethod} of 55 have a method backed by at least one guide`
    + (reportedOnly.length > 0
      ? ` · ${reportedOnly.length} (#${reportedOnly.join(', #')}) have only a single-source reported method`
      : '');
  details.append(summary);

  const note = document.createElement('p');
  note.className = 'muted';
  note.textContent = 'A cell is marked “method” only when that source is actually cited for that trophy’s unlock method; “reported” means one source only, not confirmed by a second guide. “List” means the source lists the trophy without giving its method here.';
  details.append(note);

  const scroll = document.createElement('div');
  scroll.className = 'matrix-scroll';
  const table = document.createElement('table');
  table.className = 'matrix-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const corner = document.createElement('th');
  corner.className = 'row-head';
  corner.scope = 'col';
  corner.textContent = 'Trophy';
  headRow.append(corner);
  for (const id of columns) {
    const source = sources.get(id);
    const th = document.createElement('th');
    th.className = 'col-head';
    th.scope = 'col';
    th.title = `${source.publisher} — ${source.title}`;
    const span = document.createElement('span');
    span.textContent = columnLabel(source);
    th.append(span);
    headRow.append(th);
  }
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement('tbody');
  for (const row of matrix.rows) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.className = 'row-head';
    th.scope = 'row';
    const trophy = getTrophy(state, row.id);
    th.textContent = trophy ? `#${row.id} ${displayName(state, trophy)}` : `#${row.id}`;
    tr.append(th);
    for (const id of columns) {
      const td = document.createElement('td');
      const mark = (row.cells || {})[id];
      if (mark === 'method') {
        td.className = 'cell-method';
        td.textContent = '✓';
        td.title = 'Walkthrough gives the unlock method';
      } else if (mark === 'reported') {
        td.className = 'cell-reported';
        td.textContent = '?';
        td.title = 'Method reported by this source only — not confirmed';
      } else if (mark === 'list') {
        td.className = 'cell-list';
        td.textContent = '·';
        td.title = 'Lists this trophy';
      }
      tr.append(td);
    }
    tbody.append(tr);
  }
  table.append(tbody);
  scroll.append(table);
  details.append(scroll);

  const legend = document.createElement('p');
  legend.className = 'muted matrix-legend';
  legend.textContent = '✓ method backed by this guide · ? reported by one source only, not confirmed · · lists the trophy · blank: not covered by this source.';
  details.append(legend);
  host.append(details);
}
