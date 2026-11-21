# VICE CITY — Platinum Operations

An offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5: all 55 official trophies, a saved checklist, a six-phase platinum roadmap, missable flags, spoiler protection, and a guide for every trophy that cites its sources.

Unofficial, fan-made, and not affiliated with Rockstar Games or PlayStation. Built for make.fun's gta6-trophy-guide-01 bounty.

## Run it

Node 22, standard library only, no build step:

- `node serve.ts`, then open http://localhost:8080 — or open `app/index.html` directly in a browser.
- The app loads nothing over the network and works with the network off.

## Features

- Trophy tracker: tick trophies earned, filter by kind/grade, search by name, description or #id; progress saves in localStorage.
- Six-phase platinum roadmap with per-phase progress, missable alerts, and a Next up list.
- Guide pane for every trophy: method in our own words, steps, tips, and the sources cited beside each guide.
- Spoiler shield: hidden trophies stay masked until you earn them (or turn the shield off).
- Source matrix: the 55×18 table of which source lists, reports, or gives the method for each trophy.
- Data audit strip: live checks of the guide's own data (trophy count, grades, names, descriptions, guides, hidden flags, roadmap coverage).
- Backup: export/import progress as JSON, and reset.

## Data and limitations — read this first

- Names, descriptions, grades and hidden flags are the official PlayStation 5 list as Exophase and PSNProfiles published it (both agree), saved with the app. The app never checks a live official list: the audit strip checks the data against the stored reference manifest.
- Grand Theft Auto VI is not released yet, so unlock methods come from guides, not from a played-through game. Methods change as guides are updated; the guide says what is known, what is not, and what only one source reports.
- Only five trophies have a method confirmed by two independent sources: #37, #44, #45, #46 and #50. Two trophies (#49 and #51) have no confirmed method at all — the guide says so explicitly and presents no steps for them. The rest rest on a single guide's walkthrough — PowerPyx's, in all 48 cases.
- Evidence, honestly counted: one "unit" is a guide text, one step, or one tip. The tiers count units by the evidence for the trophy's method as a whole — 32 units confirmed by 2+ independent sources, 198 units single-source, 2 units unconfirmed. A unit is not an individually verified claim: the sources back the trophy's method, not each step or tip one by one. The old "232 cited claims" total overstated this and is gone.
- Sources were accessed 21 November 2026 and are listed in `app/data/sources.json` (18 sources) with the 55×18 matrix.

## Build (for the bounty)

- `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` (the summary the judge reads). Do not edit `dossier.json` by hand: the scorer requires it byte for byte what its own copy writes.
- Screenshots live in `screenshots/` (4 JPEGs, each under 256 KiB); `shots.json` names the views.
