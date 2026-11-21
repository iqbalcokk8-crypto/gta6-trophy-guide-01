// VICE CITY — PLATINUM OPERATIONS: the GTA VI trophy guide and tracker for
// make.fun's gta6-trophy-guide-01 bounty ($250), built 2026-11-21 in the
// recorded agent session. app/ is vanilla HTML/CSS/JS, fully offline: the
// 55 official PlayStation trophies live in app/data/trophies.json, progress
// in localStorage, and the guide pane cites its sources beside each guide.
// The buildDossier plumbing below is the kit's own, left unchanged.
// A working gta6-trophy-guide-01 entry (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network. Its trophy list and guides are app/data/trophies.json, the source registry and the 55x18
// evidence matrix are app/data/sources.json, and the six-phase platinum roadmap is app/data/roadmap.json.
// The program hands it in: it copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads (the screenshots, the first load's files and bytes, and the
// source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes. Put 3 or 4 PNG or JPEG screenshots of the app in
// screenshots/ (the first by name is the cover; shots.json says which views they were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
