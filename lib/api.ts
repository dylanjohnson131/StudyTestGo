import type {
  Chapter,
  ChapterSummary,
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

// Chapters
export const fetchChapters = () => request<ChapterSummary[]>("/api/chapters");
export const fetchChapter = (id: string) => request<Chapter>(`/api/chapters/${id}`);
export const createChapter = (name: string) =>
  request<Chapter>("/api/chapters", { method: "POST", body: JSON.stringify({ name }) });
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
export const fetchUnits = () => request<UnitSummary[]>("/api/units");
export const fetchUnit = (id: string) => request<UnitDetail>(`/api/units/${id}`);
export const createUnit = (name: string, chapterIds: string[]) =>
  request<Unit>("/api/units", { method: "POST", body: JSON.stringify({ name, chapterIds }) });
export const updateUnit = (id: string, updates: { name?: string; chapterIds?: string[] }) =>
  request<Unit>(`/api/units/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const deleteUnit = (id: string) => request<{ ok: true }>(`/api/units/${id}`, { method: "DELETE" });

// Unit tests
export const fetchUnitTests = (unitId: string) => request<TestAttempt[]>(`/api/units/${unitId}/tests`);
export const submitUnitTest = (
  unitId: string,
  payload: { score: number; total: number; termResults: TermResult[] }
) => request<TestAttempt>(`/api/units/${unitId}/tests`, { method: "POST", body: JSON.stringify(payload) });
