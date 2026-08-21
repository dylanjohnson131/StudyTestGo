"use client";

import { useMemo, useState } from "react";
import type { Term, Mastery } from "@/lib/types";
import * as api from "@/lib/api";
import { weightedShuffle } from "@/lib/weighting";

export default function Flashcards({ terms, onReviewed }: { terms: Term[]; onReviewed: () => Promise<void> }) {
  const [deck, setDeck] = useState(() => weightedShuffle(terms));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = deck[index];
  const done = deck.length === 0 || index >= deck.length;

  function restart() {
    setDeck(weightedShuffle(terms));
    setIndex(0);
    setFlipped(false);
  }

  async function handleReview(result: Mastery) {
    if (!current || busy) return;
    setBusy(true);
    try {
      await api.reviewTerm(current.id, result);
      await onReviewed();
      setFlipped(false);
      setIndex((i) => i + 1);
    } finally {
      setBusy(false);
    }
  }

  const progressText = useMemo(() => `${Math.min(index + 1, deck.length)} / ${deck.length}`, [index, deck.length]);

  if (terms.length === 0) {
    return <p className="muted">Add some terms first to start studying.</p>;
  }

  if (done) {
    return (
      <div className="flashcards-done">
        <p>You&apos;ve gone through all {deck.length} cards.</p>
        <button className="btn btn-primary" onClick={restart}>
          Study again
        </button>
      </div>
    );
  }

  return (
    <div className="flashcards">
      <div className="flashcards-progress">{progressText}</div>
      <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
        <div className="flashcard-face">{flipped ? current.definition : current.term}</div>
        <div className="flashcard-hint muted">{flipped ? "Definition" : "Term"} · click to flip</div>
      </div>
      <div className="flashcard-actions">
        <button className="btn btn-learning" disabled={busy} onClick={() => handleReview("learning")}>
          Still learning
        </button>
        <button className="btn btn-known" disabled={busy} onClick={() => handleReview("known")}>
          Know it
        </button>
      </div>
    </div>
  );
}
