import type { MasteryCounts } from "@/lib/types";

export default function ProgressBar({ mastery }: { mastery: MasteryCounts }) {
  const { new: newCount, learning, known, total } = mastery;

  if (total === 0) {
    return (
      <div className="progress-bar-wrap">
        <div className="progress-bar empty" />
        <div className="progress-label">No terms yet</div>
      </div>
    );
  }

  const pct = (n: number) => (n / total) * 100;
  const knownPct = Math.round(pct(known));

  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar">
        <div className="segment known" style={{ width: `${pct(known)}%` }} />
        <div className="segment learning" style={{ width: `${pct(learning)}%` }} />
        <div className="segment new" style={{ width: `${pct(newCount)}%` }} />
      </div>
      <div className="progress-label">
        {knownPct}% known &middot; {known}/{total} mastered
      </div>
    </div>
  );
}
