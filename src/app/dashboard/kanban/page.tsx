import { collections, connectDB, dbConnect, toObjectId } from "@/lib/dbConnect";
import { KanbanBoard } from "@/components/jobs/kanban-board";
import { auth } from "@/lib/auth";

const statuses = [
  { status: "Applied", label: "Applied" },
  { status: "Interview", label: "Interview" },
  { status: "Rejected", label: "Rejected" },
  { status: "Offer", label: "Offer" },
];

export default async function KanbanPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let columns: {
    status: string;
    label: string;
    jobs: Record<string, unknown>[];
  }[] = statuses.map((s) => ({
    status: s.status,
    label: s.label,
    jobs: [],
  }));

  if (userId) {
    await connectDB();
    const jobsCollection = dbConnect(collections.JOBS);

    const jobs = await jobsCollection
      .find({
        userId: toObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    columns = columns.map((col) => ({
      ...col,
      jobs: jobs.filter((j) => j.status === col.status),
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Kanban Board
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Drag and drop to update job status
        </p>
      </div>
      <KanbanBoard columns={columns} />
    </div>
  );
}
