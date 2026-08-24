"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Chapter, TestAttempt } from "@/lib/types";
import * as api from "@/lib/api";
import TermsEditor from "@/components/TermsEditor";
import StudyTabs from "@/components/StudyTabs";

export default function ChapterWorkspace({
  chapterId,
  initialChapter,
  initialTestAttempts,
}: {
  chapterId: string;
  initialChapter: Chapter;
  initialTestAttempts: TestAttempt[];
}) {
  const router = useRouter();

  const [chapter, setChapter] = useState<Chapter>(initialChapter);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(initialTestAttempts);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(initialChapter.name);

  const refreshChapter = useCallback(async () => {
    const c = await api.fetchChapter(chapterId);
    setChapter(c);
    setNameDraft(c.name);
  }, [chapterId]);

  const refreshTests = useCallback(async () => {
    setTestAttempts(await api.fetchChapterTests(chapterId));
  }, [chapterId]);

  async function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    setEditingName(false);
    if (!trimmed || trimmed === chapter.name) return;
    await api.renameChapter(chapterId, trimmed);
    await refreshChapter();
  }

  async function handleDeleteChapter() {
    if (!confirm(`Delete "${chapter.name}"? This removes all its terms and test history.`)) return;
    await api.deleteChapter(chapterId);
    router.push(`/classes/${chapter.classId}`);
  }

  return (
    <main className="container">
      <Link href={`/classes/${chapter.classId}`} className="back-link">
        ← All chapters
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
            {chapter.name}
          </h1>
        )}
        <button className="btn btn-danger" onClick={handleDeleteChapter}>
          Delete chapter
        </button>
      </header>

      <StudyTabs
        terms={chapter.terms}
        testAttempts={testAttempts}
        onReviewed={refreshChapter}
        onSubmitTest={async (score, total, termResults) => {
          await api.submitChapterTest(chapterId, { score, total, termResults });
          await Promise.all([refreshChapter(), refreshTests()]);
        }}
        termsEditor={<TermsEditor chapterId={chapterId} terms={chapter.terms} onChanged={refreshChapter} />}
      />
    </main>
  );
}
