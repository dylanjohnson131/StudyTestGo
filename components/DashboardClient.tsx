"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChapterSummary } from "@/lib/types";
import * as api from "@/lib/api";
import ChapterCard from "@/components/ChapterCard";

export default function DashboardClient({ initialChapters }: { initialChapters: ChapterSummary[] }) {
  const [chapters, setChapters] = useState<ChapterSummary[]>(initialChapters);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setChapters(await api.fetchChapters());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await api.createChapter(name);
      setNewName("");
      await refresh();
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id: string, name: string) {
    await api.renameChapter(id, name);
    await refresh();
  }

  async function handleDelete(id: string) {
    await api.deleteChapter(id);
    await refresh();
  }

  return (
    <main className="container">
      <header className="page-header">
        <h1>StudyTestGo</h1>
        <Link href="/units" className="btn">
          Unit Study
        </Link>
      </header>

      <form className="create-chapter-form" onSubmit={handleCreate}>
        <input
          placeholder="New chapter name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
        />
        <button className="btn btn-primary" type="submit" disabled={creating || !newName.trim()}>
          Create chapter
        </button>
      </form>

      {chapters.length === 0 && <p className="muted">No chapters yet. Create one above to get started.</p>}

      <div className="chapter-grid">
        {chapters.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} onRename={handleRename} onDelete={handleDelete} />
        ))}
      </div>
    </main>
  );
}
