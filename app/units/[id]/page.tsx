import Link from "next/link";
import { getUnit, getUnitChapters, listChapters, listUnitTestAttempts } from "@/lib/store";
import UnitWorkspace from "@/components/UnitWorkspace";
import type { UnitDetail } from "@/lib/types";

export default async function UnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unit = await getUnit(id);

  if (!unit) {
    return (
      <main className="container">
        <p>Unit not found.</p>
        <Link href="/units">Back to units</Link>
      </main>
    );
  }

  const [chapters, testAttempts, allChapters] = await Promise.all([
    getUnitChapters(unit),
    listUnitTestAttempts(id),
    listChapters(),
  ]);

  const unitDetail: UnitDetail = {
    ...unit,
    chapters: chapters.map((c) => ({ id: c.id, name: c.name, termCount: c.terms.length })),
    terms: chapters.flatMap((c) => c.terms),
  };

  return (
    <UnitWorkspace
      unitId={id}
      initialUnit={unitDetail}
      initialTestAttempts={testAttempts ?? []}
      initialAllChapters={allChapters}
    />
  );
}
