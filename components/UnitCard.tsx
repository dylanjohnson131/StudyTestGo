"use client";

import { useState } from "react";
import Link from "next/link";
import type { UnitSummary } from "@/lib/types";
import ProgressBar from "./ProgressBar";

export default function UnitCard({
  unit,
  onRename,
  onDelete,
}: {
  unit: UnitSummary;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(unit.name);
  const [busy, setBusy] = useState(false);

  async function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === unit.name) {
      setEditing(false);
      setName(unit.name);
      return;
    }
    setBusy(true);
    await onRename(unit.id, trimmed);
    setBusy(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete unit "${unit.name}"? Chapters themselves are not affected.`)) return;
    setBusy(true);
    await onDelete(unit.id);
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
          <Link href={`/units/${unit.id}`} className="chapter-card-title">
            {unit.name}
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
        {unit.chapterIds.length} chapters &middot; {unit.termCount} terms
      </div>

      <ProgressBar mastery={unit.mastery} />

      <div className="chapter-card-test">
        {unit.latestTest ? (
          <span>
            Last test: {Math.round((unit.latestTest.score / unit.latestTest.total) * 100)}% on{" "}
            {new Date(unit.latestTest.takenAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="muted">No tests taken yet</span>
        )}
      </div>

      <Link href={`/units/${unit.id}`} className="btn btn-primary chapter-card-open">
        Open
      </Link>
    </div>
  );
}
