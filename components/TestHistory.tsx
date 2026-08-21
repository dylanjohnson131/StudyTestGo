import type { TestAttempt } from "@/lib/types";

export default function TestHistory({ attempts }: { attempts: TestAttempt[] }) {
  if (attempts.length === 0) {
    return <p className="muted">No tests taken yet.</p>;
  }

  return (
    <table className="test-history">
      <thead>
        <tr>
          <th>Date</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {attempts.map((a) => (
          <tr key={a.id}>
            <td>
              {new Date(a.takenAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </td>
            <td>
              {a.score}/{a.total} ({Math.round((a.score / a.total) * 100)}%)
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
