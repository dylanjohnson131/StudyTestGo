"use client";

import { useState } from "react";
import type { Term } from "@/lib/types";
import * as api from "@/lib/api";

export default function TermsEditor({
  chapterId,
  terms,
  onChanged,
}: {
  chapterId: string;
  terms: Term[];
  onChanged: () => Promise<void>;
}) {
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) return;
    setBusy(true);
    try {
      await api.addTerm(chapterId, newTerm, newDefinition);
      setNewTerm("");
      setNewDefinition("");
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleFieldBlur(term: Term, field: "term" | "definition", value: string) {
    const trimmed = value.trim();
    if (!trimmed || trimmed === term[field]) return;
    await api.updateTerm(term.id, { [field]: trimmed });
    await onChanged();
  }

  async function handleDelete(term: Term) {
    if (!confirm(`Delete "${term.term}"?`)) return;
    await api.deleteTerm(term.id);
    await onChanged();
  }

  return (
    <div className="terms-editor">
      {terms.length === 0 && <p className="muted">No terms yet — add your first one below.</p>}

      {terms.length > 0 && (
        <div className="terms-table">
          <div className="terms-row terms-header">
            <div>Term</div>
            <div>Definition</div>
            <div>Mastery</div>
            <div />
          </div>
          {terms.map((term) => (
            <div className="terms-row" key={term.id}>
              <input
                defaultValue={term.term}
                onBlur={(e) => handleFieldBlur(term, "term", e.target.value)}
              />
              <input
                defaultValue={term.definition}
                onBlur={(e) => handleFieldBlur(term, "definition", e.target.value)}
              />
              <span className={`badge badge-${term.mastery}`}>{term.mastery}</span>
              <button className="icon-btn danger" onClick={() => handleDelete(term)} title="Delete">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="add-term-form" onSubmit={handleAdd}>
        <input
          placeholder="Term"
          value={newTerm}
          onChange={(e) => setNewTerm(e.target.value)}
          disabled={busy}
        />
        <input
          placeholder="Definition"
          value={newDefinition}
          onChange={(e) => setNewDefinition(e.target.value)}
          disabled={busy}
        />
        <button className="btn btn-primary" type="submit" disabled={busy || !newTerm.trim() || !newDefinition.trim()}>
          Add term
        </button>
      </form>
    </div>
  );
}
