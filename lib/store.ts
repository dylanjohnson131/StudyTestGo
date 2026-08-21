import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Chapter,
  ChapterSummary,
  Mastery,
  MasteryCounts,
  Term,
  TermResult,
  TestAttempt,
  Unit,
  UnitSummary,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CHAPTERS_DIR = path.join(DATA_DIR, "chapters");
const UNITS_FILE = path.join(DATA_DIR, "units.json");

async function ensureDirs() {
  await fs.mkdir(CHAPTERS_DIR, { recursive: true });
}

function chapterPath(id: string) {
  return path.join(CHAPTERS_DIR, `${id}.json`);
}

async function readJSON<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeJSON(filePath: string, data: unknown) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function now() {
  return new Date().toISOString();
}

function computeMastery(terms: Term[]): MasteryCounts {
  const counts: MasteryCounts = { new: 0, learning: 0, known: 0, total: terms.length };
  for (const t of terms) counts[t.mastery]++;
  return counts;
}

function latestOf(attempts: TestAttempt[]): TestAttempt | null {
  if (attempts.length === 0) return null;
  return [...attempts].sort((a, b) => b.takenAt.localeCompare(a.takenAt))[0];
}

// ---- Chapters ----

export async function listChapterIds(): Promise<string[]> {
  await ensureDirs();
  const files = await fs.readdir(CHAPTERS_DIR);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
}

function toChapterSummary(c: Chapter): ChapterSummary {
  return {
    id: c.id,
    name: c.name,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    termCount: c.terms.length,
    mastery: computeMastery(c.terms),
    latestTest: latestOf(c.testAttempts),
  };
}

export async function listChapters(): Promise<ChapterSummary[]> {
  const ids = await listChapterIds();
  const chapters = await Promise.all(ids.map((id) => getChapter(id)));
  return chapters
    .filter((c): c is Chapter => c !== null)
    .map(toChapterSummary)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getChapter(id: string): Promise<Chapter | null> {
  await ensureDirs();
  return readJSON<Chapter>(chapterPath(id));
}

export async function createChapter(name: string): Promise<Chapter> {
  await ensureDirs();
  const chapter: Chapter = {
    id: randomUUID(),
    name: name.trim(),
    createdAt: now(),
    updatedAt: now(),
    terms: [],
    testAttempts: [],
  };
  await writeJSON(chapterPath(chapter.id), chapter);
  return chapter;
}

export async function renameChapter(id: string, name: string): Promise<Chapter | null> {
  const chapter = await getChapter(id);
  if (!chapter) return null;
  chapter.name = name.trim();
  chapter.updatedAt = now();
  await writeJSON(chapterPath(id), chapter);
  return chapter;
}

export async function deleteChapter(id: string): Promise<boolean> {
  try {
    await fs.unlink(chapterPath(id));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }

  const units = await readUnits();
  let changed = false;
  for (const u of units) {
    if (u.chapterIds.includes(id)) {
      u.chapterIds = u.chapterIds.filter((cid) => cid !== id);
      u.updatedAt = now();
      changed = true;
    }
  }
  if (changed) await writeUnits(units);
  return true;
}

// ---- Terms ----

export async function addTerm(chapterId: string, term: string, definition: string): Promise<Term | null> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return null;
  const newTerm: Term = {
    id: randomUUID(),
    term: term.trim(),
    definition: definition.trim(),
    mastery: "new",
    lastReviewedAt: null,
    createdAt: now(),
    updatedAt: now(),
  };
  chapter.terms.push(newTerm);
  chapter.updatedAt = now();
  await writeJSON(chapterPath(chapterId), chapter);
  return newTerm;
}

export async function addTerms(
  chapterId: string,
  entries: { term: string; definition: string }[]
): Promise<Term[] | null> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return null;
  const created: Term[] = entries.map((e) => ({
    id: randomUUID(),
    term: e.term.trim(),
    definition: e.definition.trim(),
    mastery: "new",
    lastReviewedAt: null,
    createdAt: now(),
    updatedAt: now(),
  }));
  chapter.terms.push(...created);
  chapter.updatedAt = now();
  await writeJSON(chapterPath(chapterId), chapter);
  return created;
}

async function findChapterByTermId(termId: string): Promise<Chapter | null> {
  const ids = await listChapterIds();
  for (const id of ids) {
    const chapter = await getChapter(id);
    if (chapter && chapter.terms.some((t) => t.id === termId)) return chapter;
  }
  return null;
}

export async function updateTerm(
  termId: string,
  updates: { term?: string; definition?: string }
): Promise<Term | null> {
  const chapter = await findChapterByTermId(termId);
  if (!chapter) return null;
  const term = chapter.terms.find((t) => t.id === termId);
  if (!term) return null;
  if (updates.term !== undefined) term.term = updates.term.trim();
  if (updates.definition !== undefined) term.definition = updates.definition.trim();
  term.updatedAt = now();
  chapter.updatedAt = now();
  await writeJSON(chapterPath(chapter.id), chapter);
  return term;
}

export async function deleteTerm(termId: string): Promise<boolean> {
  const chapter = await findChapterByTermId(termId);
  if (!chapter) return false;
  chapter.terms = chapter.terms.filter((t) => t.id !== termId);
  chapter.updatedAt = now();
  await writeJSON(chapterPath(chapter.id), chapter);
  return true;
}

export async function reviewTerm(termId: string, result: Mastery): Promise<Term | null> {
  const chapter = await findChapterByTermId(termId);
  if (!chapter) return null;
  const term = chapter.terms.find((t) => t.id === termId);
  if (!term) return null;
  term.mastery = result;
  term.lastReviewedAt = now();
  term.updatedAt = now();
  chapter.updatedAt = now();
  await writeJSON(chapterPath(chapter.id), chapter);
  return term;
}

function applyTermResults(terms: Term[], termResults: TermResult[]) {
  const byId = new Map(termResults.map((r) => [r.termId, r.correct]));
  for (const t of terms) {
    const result = byId.get(t.id);
    if (result === undefined) continue;
    t.mastery = result ? "known" : "learning";
    t.lastReviewedAt = now();
    t.updatedAt = now();
  }
}

// ---- Chapter tests ----

export async function addChapterTestAttempt(
  chapterId: string,
  score: number,
  total: number,
  termResults: TermResult[]
): Promise<TestAttempt | null> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return null;
  const attempt: TestAttempt = { id: randomUUID(), score, total, takenAt: now() };
  chapter.testAttempts.push(attempt);
  applyTermResults(chapter.terms, termResults);
  chapter.updatedAt = now();
  await writeJSON(chapterPath(chapterId), chapter);
  return attempt;
}

export async function listChapterTestAttempts(chapterId: string): Promise<TestAttempt[] | null> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return null;
  return [...chapter.testAttempts].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}

// ---- Units ----

async function readUnits(): Promise<Unit[]> {
  await ensureDirs();
  const units = await readJSON<Unit[]>(UNITS_FILE);
  return units ?? [];
}

async function writeUnits(units: Unit[]) {
  await writeJSON(UNITS_FILE, units);
}

export async function listUnits(): Promise<Unit[]> {
  const units = await readUnits();
  return [...units].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getUnit(id: string): Promise<Unit | null> {
  const units = await readUnits();
  return units.find((u) => u.id === id) ?? null;
}

export async function createUnit(name: string, chapterIds: string[]): Promise<Unit> {
  const units = await readUnits();
  const unit: Unit = {
    id: randomUUID(),
    name: name.trim(),
    chapterIds: [...new Set(chapterIds)],
    testAttempts: [],
    createdAt: now(),
    updatedAt: now(),
  };
  units.push(unit);
  await writeUnits(units);
  return unit;
}

export async function updateUnit(
  id: string,
  updates: { name?: string; chapterIds?: string[] }
): Promise<Unit | null> {
  const units = await readUnits();
  const unit = units.find((u) => u.id === id);
  if (!unit) return null;
  if (updates.name !== undefined) unit.name = updates.name.trim();
  if (updates.chapterIds !== undefined) unit.chapterIds = [...new Set(updates.chapterIds)];
  unit.updatedAt = now();
  await writeUnits(units);
  return unit;
}

export async function deleteUnit(id: string): Promise<boolean> {
  const units = await readUnits();
  const idx = units.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  units.splice(idx, 1);
  await writeUnits(units);
  return true;
}

export async function getUnitChapters(unit: Unit): Promise<Chapter[]> {
  const chapters = await Promise.all(unit.chapterIds.map((id) => getChapter(id)));
  return chapters.filter((c): c is Chapter => c !== null);
}

export async function getUnitPooledTerms(unit: Unit): Promise<Term[]> {
  const chapters = await getUnitChapters(unit);
  return chapters.flatMap((c) => c.terms);
}

export async function toUnitSummary(unit: Unit): Promise<UnitSummary> {
  const terms = await getUnitPooledTerms(unit);
  return {
    id: unit.id,
    name: unit.name,
    chapterIds: unit.chapterIds,
    createdAt: unit.createdAt,
    updatedAt: unit.updatedAt,
    termCount: terms.length,
    mastery: computeMastery(terms),
    latestTest: latestOf(unit.testAttempts),
  };
}

export async function listUnitSummaries(): Promise<UnitSummary[]> {
  const units = await listUnits();
  return Promise.all(units.map(toUnitSummary));
}

export async function addUnitTestAttempt(
  unitId: string,
  score: number,
  total: number,
  termResults: TermResult[]
): Promise<TestAttempt | null> {
  const units = await readUnits();
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return null;
  const attempt: TestAttempt = { id: randomUUID(), score, total, takenAt: now() };
  unit.testAttempts.push(attempt);
  unit.updatedAt = now();
  await writeUnits(units);

  const chapters = await getUnitChapters(unit);
  for (const chapter of chapters) {
    const before = JSON.stringify(chapter.terms);
    applyTermResults(chapter.terms, termResults);
    if (JSON.stringify(chapter.terms) !== before) {
      chapter.updatedAt = now();
      await writeJSON(chapterPath(chapter.id), chapter);
    }
  }

  return attempt;
}

export async function listUnitTestAttempts(unitId: string): Promise<TestAttempt[] | null> {
  const unit = await getUnit(unitId);
  if (!unit) return null;
  return [...unit.testAttempts].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}
