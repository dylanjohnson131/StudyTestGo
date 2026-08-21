import Link from "next/link";
import { getChapter, listChapterTestAttempts } from "@/lib/store";
import ChapterWorkspace from "@/components/ChapterWorkspace";

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = await getChapter(id);

  if (!chapter) {
    return (
      <main className="container">
        <p>Chapter not found.</p>
        <Link href="/">Back to dashboard</Link>
      </main>
    );
  }

  const testAttempts = (await listChapterTestAttempts(id)) ?? [];

  return <ChapterWorkspace chapterId={id} initialChapter={chapter} initialTestAttempts={testAttempts} />;
}
