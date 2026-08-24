import Link from "next/link";
import { getClass, listChapters } from "@/lib/store";
import DashboardClient from "@/components/DashboardClient";

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
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

  const chapters = await listChapters(id);

  return <DashboardClient classId={id} className={cls.name} initialChapters={chapters} />;
}
