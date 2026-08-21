# StudyTestGo

A local study app: organize material into chapters, then study it with flashcards, a matching
game, and auto-generated tests. Chapters track your mastery of each term and keep a history of
test scores over time. Pair multiple chapters into a **Unit** to study or test across them
together (great for exam review).

## Features

- **Chapters** — create, rename, and delete study "folders." Each one holds a list of
  term/definition pairs.
- **Flashcards** — flip through a chapter's terms and self-report "Still learning" or "Know it" to
  track mastery.
- **Matching game** — a timed grid game matching terms to definitions. Practice only, not scored.
- **Tests** — an auto-generated multiple-choice quiz built from a chapter's terms. Scores and
  dates are saved to that chapter's history, and answers update term mastery.
- **Progress** — each chapter (and unit) shows a mastery breakdown (New / Learning / Known) and
  its full test score history.
- **Units** — group chapters together and study/test the combined term pool, with its own separate
  score history.

All data is stored locally as JSON files under `data/` (gitignored) — nothing leaves your machine.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech

Next.js (App Router) + React + TypeScript, single process, no database — a small filesystem-backed
JSON store (`lib/store.ts`) persists chapters and units under `data/`.
