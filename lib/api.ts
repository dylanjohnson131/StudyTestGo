import type {
  Chapter,
  ChapterSummary,
  Class,
  ClassSummary,
  Mastery,
  Term,
  TermResult,
  TestAttempt,
  Unit,
  UnitDetail,
  UnitSummary,
} from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Classes
export const fetchClasses = () => request<ClassSummary[]>("/api/classes");
export const fetchClass = (id: string) => request<Class>(`/api/classes/${id}`);
export const createClass = (name: string) =>
  request<Class>("/api/classes", { method: "POST", body: JSON.stringify({ name }) });
export const renameClass = (id: string, name: string) =>
  request<Class>(`/api/classes/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
export const deleteClass = (id: string) =>
  request<{ ok: true }>(`/api/classes/${id}`, { method: "DELETE" });

// Chapters
export const fetchChapters = (classId: string) =>
  request<ChapterSummary[]>(`/api/chapters?classId=${classId}`);
export const fetchChapter = (id: string) => request<Chapter>(`/api/chapters/${id}`);
export const createChapter = (classId: string, name: string) =>
  request<Chapter>("/api/chapters", { method: "POST", body: JSON.stringify({ classId, name }) });
export const renameChapter = (id: string, name: string) =>
  request<Chapter>(`/api/chapters/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
export const deleteChapter = (id: string) =>
  request<{ ok: true }>(`/api/chapters/${id}`, { method: "DELETE" });

// Terms
export const addTerm = (chapterId: string, term: string, definition: string) =>
  request<Term>(`/api/chapters/${chapterId}/terms`, {
    method: "POST",
    body: JSON.stringify({ term, definition }),
  });
export const bulkAddTerms = (chapterId: string, entries: { term: string; definition: string }[]) =>
  request<Term[]>(`/api/chapters/${chapterId}/terms/bulk`, {
    method: "POST",
    body: JSON.stringify({ entries }),
  });
export const updateTerm = (id: string, updates: { term?: string; definition?: string }) =>
  request<Term>(`/api/terms/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const deleteTerm = (id: string) => request<{ ok: true }>(`/api/terms/${id}`, { method: "DELETE" });
export const reviewTerm = (id: string, result: Mastery) =>
  request<Term>(`/api/terms/${id}/review`, { method: "POST", body: JSON.stringify({ result }) });

// Chapter tests
export const fetchChapterTests = (chapterId: string) =>
  request<TestAttempt[]>(`/api/chapters/${chapterId}/tests`);
export const submitChapterTest = (
  chapterId: string,
  payload: { score: number; total: number; termResults: TermResult[] }
) => request<TestAttempt>(`/api/chapters/${chapterId}/tests`, { method: "POST", body: JSON.stringify(payload) });

// Units
export const fetchUnits = (classId: string) => request<UnitSummary[]>(`/api/units?classId=${classId}`);
export const fetchUnit = (id: string) => request<UnitDetail>(`/api/units/${id}`);
export const createUnit = (classId: string, name: string, chapterIds: string[]) =>
  request<Unit>("/api/units", { method: "POST", body: JSON.stringify({ classId, name, chapterIds }) });
export const updateUnit = (id: string, updates: { name?: string; chapterIds?: string[] }) =>
  request<Unit>(`/api/units/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const deleteUnit = (id: string) => request<{ ok: true }>(`/api/units/${id}`, { method: "DELETE" });

// Unit tests
export const fetchUnitTests = (unitId: string) => request<TestAttempt[]>(`/api/units/${unitId}/tests`);
export const submitUnitTest = (
  unitId: string,
  payload: { score: number; total: number; termResults: TermResult[] }
) => request<TestAttempt>(`/api/units/${unitId}/tests`, { method: "POST", body: JSON.stringify(payload) });
