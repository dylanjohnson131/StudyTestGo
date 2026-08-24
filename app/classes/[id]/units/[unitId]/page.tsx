import Link from "next/link";
import { getUnit, getUnitChapters, listChapters, listUnitTestAttempts } from "@/lib/store";
import UnitWorkspace from "@/components/UnitWorkspace";
import type { UnitDetail } from "@/lib/types";

export default async function UnitPage({ params }: { params: Promise<{ id: string; unitId: string }> }) {
  const { id, unitId } = await params;
  const unit = await getUnit(unitId);

  if (!unit || unit.classId !== id) {
    return (
      <main className="container">
        <p>Unit not found.</p>
        <Link href={`/classes/${id}/units`}>Back to units</Link>
      </main>
    );
  }

  const [chapters, testAttempts, allChapters] = await Promise.all([
    getUnitChapters(unit),
    listUnitTestAttempts(unitId),
    listChapters(id),
  ]);

  const unitDetail: UnitDetail = {
    ...unit,
    chapters: chapters.map((c) => ({ id: c.id, name: c.name, termCount: c.terms.length })),
    terms: chapters.flatMap((c) => c.terms),
  };

  return (
    <UnitWorkspace
      unitId={unitId}
      initialUnit={unitDetail}
      initialTestAttempts={testAttempts ?? []}
      initialAllChapters={allChapters}
    />
  );
}
