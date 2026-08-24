"use client";

import { useState } from "react";
import type { ClassSummary } from "@/lib/types";
import * as api from "@/lib/api";
import ClassCard from "@/components/ClassCard";

export default function ClassesClient({ initialClasses }: { initialClasses: ClassSummary[] }) {
  const [classes, setClasses] = useState<ClassSummary[]>(initialClasses);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setClasses(await api.fetchClasses());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await api.createClass(name);
      setNewName("");
      await refresh();
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id: string, name: string) {
    await api.renameClass(id, name);
    await refresh();
  }

  async function handleDelete(id: string) {
    await api.deleteClass(id);
    await refresh();
  }

  return (
    <main className="container">
      <header className="page-header">
        <h1>StudyTestGo</h1>
      </header>
      <p className="muted">Create a class, then open it to build out its chapters and units.</p>

      <form className="create-chapter-form" onSubmit={handleCreate}>
        <input
          placeholder="New class name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
        />
        <button className="btn btn-primary" type="submit" disabled={creating || !newName.trim()}>
          Create class
        </button>
      </form>

      {classes.length === 0 && <p className="muted">No classes yet. Create one above to get started.</p>}

      <div className="chapter-grid">
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls} onRename={handleRename} onDelete={handleDelete} />
        ))}
      </div>
    </main>
  );
}
