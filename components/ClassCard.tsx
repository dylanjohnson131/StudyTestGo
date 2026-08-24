"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClassSummary } from "@/lib/types";

export default function ClassCard({
  cls,
  onRename,
  onDelete,
}: {
  cls: ClassSummary;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cls.name);
  const [busy, setBusy] = useState(false);

  async function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === cls.name) {
      setEditing(false);
      setName(cls.name);
      return;
    }
    setBusy(true);
    await onRename(cls.id, trimmed);
    setBusy(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete class "${cls.name}"? This permanently deletes all ${cls.chapterCount} chapter(s) and ${cls.unitCount} unit(s) in it.`
      )
    )
      return;
    setBusy(true);
    await onDelete(cls.id);
  }

  return (
    <div className="card chapter-card">
      <div className="chapter-card-header">
        {editing ? (
          <form onSubmit={submitRename} className="rename-form">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={submitRename}
              disabled={busy}
            />
          </form>
        ) : (
          <Link href={`/classes/${cls.id}`} className="chapter-card-title">
            {cls.name}
          </Link>
        )}
        <div className="chapter-card-actions">
          <button className="icon-btn" onClick={() => setEditing((v) => !v)} disabled={busy} title="Rename">
            ✎
          </button>
          <button className="icon-btn danger" onClick={handleDelete} disabled={busy} title="Delete">
            ✕
          </button>
        </div>
      </div>

      <div className="chapter-card-meta">
        {cls.chapterCount} chapters &middot; {cls.unitCount} units
      </div>

      <Link href={`/classes/${cls.id}`} className="btn btn-primary chapter-card-open">
        Open
      </Link>
    </div>
  );
}
