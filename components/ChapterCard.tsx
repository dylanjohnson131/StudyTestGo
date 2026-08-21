"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChapterSummary } from "@/lib/types";
import ProgressBar from "./ProgressBar";

export default function ChapterCard({
  chapter,
  onRename,
  onDelete,
}: {
  chapter: ChapterSummary;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(chapter.name);
  const [busy, setBusy] = useState(false);

  async function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === chapter.name) {
      setEditing(false);
      setName(chapter.name);
      return;
    }
    setBusy(true);
    await onRename(chapter.id, trimmed);
    setBusy(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${chapter.name}"? This removes all its terms and test history.`)) return;
    setBusy(true);
    await onDelete(chapter.id);
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
          <Link href={`/chapters/${chapter.id}`} className="chapter-card-title">
            {chapter.name}
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

      <div className="chapter-card-meta">{chapter.termCount} terms</div>

      <ProgressBar mastery={chapter.mastery} />

      <div className="chapter-card-test">
        {chapter.latestTest ? (
          <span>
            Last test: {Math.round((chapter.latestTest.score / chapter.latestTest.total) * 100)}% on{" "}
            {new Date(chapter.latestTest.takenAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="muted">No tests taken yet</span>
        )}
      </div>

      <Link href={`/chapters/${chapter.id}`} className="btn btn-primary chapter-card-open">
        Open
      </Link>
    </div>
  );
}
