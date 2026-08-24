"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChapterSummary, UnitSummary } from "@/lib/types";
import * as api from "@/lib/api";
import UnitCard from "@/components/UnitCard";

export default function UnitsClient({
  classId,
  className,
  initialUnits,
  initialChapters,
}: {
  classId: string;
  className: string;
  initialUnits: UnitSummary[];
  initialChapters: ChapterSummary[];
}) {
  const [units, setUnits] = useState<UnitSummary[]>(initialUnits);
  const [chapters, setChapters] = useState<ChapterSummary[]>(initialChapters);
  const [newName, setNewName] = useState("");
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const [u, c] = await Promise.all([api.fetchUnits(classId), api.fetchChapters(classId)]);
    setUnits(u);
    setChapters(c);
  }

  function toggleChapter(id: string) {
    setSelectedChapterIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || selectedChapterIds.length === 0) return;
    setCreating(true);
    try {
      await api.createUnit(classId, name, selectedChapterIds);
      setNewName("");
      setSelectedChapterIds([]);
      await refresh();
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id: string, name: string) {
    await api.updateUnit(id, { name });
    await refresh();
  }

  async function handleDelete(id: string) {
    await api.deleteUnit(id);
    await refresh();
  }

  return (
    <main className="container">
      <Link href={`/classes/${classId}`} className="back-link">
        ← {className}
      </Link>

      <header className="page-header">
        <h1>Unit Study</h1>
      </header>
      <p className="muted">
        Pair chapters together into a unit to study or test across all of them at once — handy for
        exam or unit review.
      </p>

      <form className="create-unit-form" onSubmit={handleCreate}>
        <input
          placeholder="New unit name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
        />
        {chapters.length === 0 ? (
          <p className="muted">Create at least one chapter before building a unit.</p>
        ) : (
          <div className="chapter-picker">
            {chapters.map((c) => (
              <label key={c.id} className="chapter-picker-item">
                <input
                  type="checkbox"
                  checked={selectedChapterIds.includes(c.id)}
                  onChange={() => toggleChapter(c.id)}
                  disabled={creating}
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={creating || !newName.trim() || selectedChapterIds.length === 0}
        >
          Create unit
        </button>
      </form>

      {units.length === 0 && <p className="muted">No units yet.</p>}

      <div className="chapter-grid">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} onRename={handleRename} onDelete={handleDelete} />
        ))}
      </div>
    </main>
  );
}
