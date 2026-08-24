export type Mastery = "new" | "learning" | "known";

export interface Term {
  id: string;
  term: string;
  definition: string;
  mastery: Mastery;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestAttempt {
  id: string;
  score: number;
  total: number;
  takenAt: string;
}

export interface Chapter {
  id: string;
  classId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  terms: Term[];
  testAttempts: TestAttempt[];
}

export interface Unit {
  id: string;
  classId: string;
  name: string;
  chapterIds: string[];
  testAttempts: TestAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSummary extends Class {
  chapterCount: number;
  unitCount: number;
}

export interface MasteryCounts {
  new: number;
  learning: number;
  known: number;
  total: number;
}

export interface ChapterSummary {
  id: string;
  classId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  termCount: number;
  mastery: MasteryCounts;
  latestTest: TestAttempt | null;
}

export interface UnitSummary {
  id: string;
  classId: string;
  name: string;
  chapterIds: string[];
  createdAt: string;
  updatedAt: string;
  termCount: number;
  mastery: MasteryCounts;
  latestTest: TestAttempt | null;
}

export type TermResult = { termId: string; correct: boolean };

export interface UnitDetail extends Unit {
  chapters: { id: string; name: string; termCount: number }[];
  terms: Term[];
}
