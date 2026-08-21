import { listChapters, listUnitSummaries } from "@/lib/store";
import UnitsClient from "@/components/UnitsClient";

export default async function UnitsPage() {
  const [units, chapters] = await Promise.all([listUnitSummaries(), listChapters()]);
  return <UnitsClient initialUnits={units} initialChapters={chapters} />;
}
