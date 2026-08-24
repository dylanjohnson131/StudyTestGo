"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChapterSummary, TestAttempt, UnitDetail } from "@/lib/types";
import * as api from "@/lib/api";
import StudyTabs from "@/components/StudyTabs";

export default function UnitWorkspace({
  unitId,
  initialUnit,
  initialTestAttempts,
  initialAllChapters,
}: {
  unitId: string;
  initialUnit: UnitDetail;
  initialTestAttempts: TestAttempt[];
  initialAllChapters: ChapterSummary[];
}) {
  const router = useRouter();

  const [unit, setUnit] = useState<UnitDetail>(initialUnit);
  const [allChapters, setAllChapters] = useState<ChapterSummary[]>(initialAllChapters);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(initialTestAttempts);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(initialUnit.name);
  const [managingChapters, setManagingChapters] = useState(false);

  const refreshUnit = useCallback(async () => {
    const u = await api.fetchUnit(unitId);
    setUnit(u);
    setNameDraft(u.name);
  }, [unitId]);

  const refreshTests = useCallback(async () => {
    setTestAttempts(await api.fetchUnitTests(unitId));
  }, [unitId]);

  async function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    setEditingName(false);
    if (!trimmed || trimmed === unit.name) return;
    await api.updateUnit(unitId, { name: trimmed });
    await refreshUnit();
  }

  async function handleDeleteUnit() {
    if (!confirm(`Delete unit "${unit.name}"? Chapters themselves are not affected.`)) return;
    await api.deleteUnit(unitId);
    router.push(`/classes/${unit.classId}/units`);
  }

  async function startManagingChapters() {
    setAllChapters(await api.fetchChapters(unit.classId));
    setManagingChapters(true);
  }

  async function toggleChapter(chapterId: string) {
    const chapterIds = unit.chapterIds.includes(chapterId)
      ? unit.chapterIds.filter((c) => c !== chapterId)
      : [...unit.chapterIds, chapterId];
    await api.updateUnit(unitId, { chapterIds });
    await refreshUnit();
  }

  return (
    <main className="container">
      <Link href={`/classes/${unit.classId}/units`} className="back-link">
        ← All units
      </Link>

      <header className="page-header">
        {editingName ? (
          <form onSubmit={submitRename} className="rename-form">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={submitRename}
            />
          </form>
        ) : (
          <h1 onClick={() => setEditingName(true)} title="Click to rename" className="editable-title">
            {unit.name}
          </h1>
        )}
        <button className="btn btn-danger" onClick={handleDeleteUnit}>
          Delete unit
        </button>
      </header>

      <div className="unit-chapters">
        <div className="unit-chapters-header">
          <strong>Chapters in this unit</strong>
          <button className="btn" onClick={() => (managingChapters ? setManagingChapters(false) : startManagingChapters())}>
            {managingChapters ? "Done" : "Edit chapters"}
          </button>
        </div>
        {managingChapters ? (
          <div className="chapter-picker">
            {allChapters.map((c) => (
              <label key={c.id} className="chapter-picker-item">
                <input
                  type="checkbox"
                  checked={unit.chapterIds.includes(c.id)}
                  onChange={() => toggleChapter(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        ) : (
          <ul className="unit-chapter-list">
            {unit.chapters.map((c) => (
              <li key={c.id}>
                <Link href={`/chapters/${c.id}`}>{c.name}</Link> <span className="muted">({c.termCount} terms)</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <StudyTabs
        terms={unit.terms}
        testAttempts={testAttempts}
        onReviewed={refreshUnit}
        onSubmitTest={async (score, total, termResults) => {
          await api.submitUnitTest(unitId, { score, total, termResults });
          await Promise.all([refreshUnit(), refreshTests()]);
        }}
      />
    </main>
  );
}
