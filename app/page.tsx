import { listClassSummaries } from "@/lib/store";
import ClassesClient from "@/components/ClassesClient";

export default async function Home() {
  const classes = await listClassSummaries();
  return <ClassesClient initialClasses={classes} />;
}
