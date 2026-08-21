"use client";

import { useMemo, useState } from "react";
import * as api from "@/lib/api";
import { parseBulkImport } from "@/lib/bulkImportParse";

export default function BulkImportPanel({
  chapterId,
  onImported,
}: {
  chapterId: string;
  onImported: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  const { entries, failed } = useMemo(() => parseBulkImport(raw), [raw]);

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab" || e.shiftKey) return;
    e.preventDefault();
    // Use the browser's native insertion so cursor position and undo history
    // stay correct — manually tracking selection via React state + rAF races
    // with fast typing and can scramble the text.
    document.execCommand("insertText", false, "\t");
  }

  async function handleImport() {
    if (entries.length === 0) return;
    setBusy(true);
    try {
      await api.bulkAddTerms(chapterId, entries);
      setRaw("");
      setOpen(false);
      await onImported();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bulk-import">
      <button className="btn" onClick={() => setOpen((v) => !v)}>
        {open ? "Cancel bulk import" : "Bulk import"}
      </button>

      {open && (
        <div className="bulk-import-panel">
          <p className="muted">
            Paste one term per line. Works with tab-separated text copied from a spreadsheet or
            Quizlet, or lines written as <code>term - definition</code> or{" "}
            <code>term: definition</code>.
          </p>
          <textarea
            className="bulk-import-textarea"
            rows={10}
            placeholder={"Mitochondria\tThe powerhouse of the cell\nNucleus\tControl center of the cell"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            disabled={busy}
          />

          <div className="bulk-import-summary">
            {raw.trim() === "" ? (
              <span className="muted">Nothing pasted yet.</span>
            ) : (
              <>
                <span className="bulk-import-count">{entries.length} terms ready to import</span>
                {failed.length > 0 && (
                  <button className="link-btn" onClick={() => setShowFailed((v) => !v)}>
                    {failed.length} line{failed.length === 1 ? "" : "s"} couldn&apos;t be parsed
                    {showFailed ? " (hide)" : " (show)"}
                  </button>
                )}
              </>
            )}
          </div>

          {showFailed && failed.length > 0 && (
            <ul className="bulk-import-failed">
              {failed.map((f) => (
                <li key={f.lineNumber}>
                  Line {f.lineNumber}: <code>{f.line}</code>
                </li>
              ))}
            </ul>
          )}

          <button className="btn btn-primary" onClick={handleImport} disabled={busy || entries.length === 0}>
            Import {entries.length > 0 ? entries.length : ""} term{entries.length === 1 ? "" : "s"}
          </button>
        </div>
      )}
    </div>
  );
}
