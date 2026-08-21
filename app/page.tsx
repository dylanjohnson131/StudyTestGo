import { listChapters } from "@/lib/store";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const chapters = await listChapters();
  return <DashboardClient initialChapters={chapters} />;
}
