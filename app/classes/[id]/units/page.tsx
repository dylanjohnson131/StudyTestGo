import Link from "next/link";
import { getClass, listChapters, listUnitSummaries } from "@/lib/store";
import UnitsClient from "@/components/UnitsClient";

export default async function ClassUnitsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cls = await getClass(id);

  if (!cls) {
    return (
      <main className="container">
        <p>Class not found.</p>
        <Link href="/">Back to classes</Link>
      </main>
    );
  }

  const [units, chapters] = await Promise.all([listUnitSummaries(id), listChapters(id)]);

  return (
    <UnitsClient classId={id} className={cls.name} initialUnits={units} initialChapters={chapters} />
  );
}
