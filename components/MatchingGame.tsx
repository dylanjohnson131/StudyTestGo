"use client";

import { useEffect, useMemo, useState } from "react";
import type { Term } from "@/lib/types";

const MAX_PAIRS = 8;

type Tile = { key: string; termId: string; kind: "term" | "definition"; text: string };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRound(terms: Term[]): Tile[] {
  const selected = shuffle(terms).slice(0, MAX_PAIRS);
  const tiles: Tile[] = selected.flatMap((t) => [
    { key: `${t.id}-term`, termId: t.id, kind: "term" as const, text: t.term },
    { key: `${t.id}-def`, termId: t.id, kind: "definition" as const, text: t.definition },
  ]);
  return shuffle(tiles);
}

export default function MatchingGame({ terms }: { terms: Term[] }) {
  const [tiles, setTiles] = useState<Tile[]>(() => buildRound(terms));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Tile | null>(null);
  const [mismatch, setMismatch] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const pairCount = useMemo(() => tiles.length / 2, [tiles]);
  const finished = tiles.length > 0 && matched.size === tiles.length;

  useEffect(() => {
    if (startedAt === null || finished) return;
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [startedAt, finished]);

  function newRound() {
    setTiles(buildRound(terms));
    setMatched(new Set());
    setSelected(null);
    setMismatch([]);
    setStartedAt(null);
    setElapsedMs(0);
  }

  function handleClick(tile: Tile) {
    if (matched.has(tile.key) || mismatch.length > 0) return;
    // eslint-disable-next-line react-hooks/purity -- runs from a click handler, not during render
    if (startedAt === null) setStartedAt(Date.now());

    if (!selected) {
      setSelected(tile);
      return;
    }
    if (selected.key === tile.key) {
      setSelected(null);
      return;
    }
    if (selected.termId === tile.termId) {
      setMatched((prev) => new Set(prev).add(selected.key).add(tile.key));
      setSelected(null);
    } else {
      setMismatch([selected.key, tile.key]);
      setTimeout(() => {
        setMismatch([]);
        setSelected(null);
      }, 600);
    }
  }

  if (terms.length < 2) {
    return <p className="muted">Add at least two terms to play the matching game.</p>;
  }

  return (
    <div className="matching-game">
      <div className="matching-header">
        <span>{pairCount} pairs</span>
        <span>{(elapsedMs / 1000).toFixed(1)}s</span>
        <button className="btn" onClick={newRound}>
          New round
        </button>
      </div>

      {finished && <p className="match-complete">Matched all {pairCount} pairs in {(elapsedMs / 1000).toFixed(1)}s!</p>}

      <div className="matching-grid">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.key);
          const isSelected = selected?.key === tile.key;
          const isMismatch = mismatch.includes(tile.key);
          return (
            <button
              key={tile.key}
              className={`match-tile ${tile.kind} ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""} ${
                isMismatch ? "mismatch" : ""
              }`}
              onClick={() => handleClick(tile)}
              disabled={isMatched}
            >
              {tile.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
