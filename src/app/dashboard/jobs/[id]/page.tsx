import { notFound } from "next/navigation";
import { getJobByIdAction } from "@/lib/actions/job-actions";
import { JobForm } from "@/components/jobs/job-form";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getJobByIdAction(id);

  if (result.error || !result.job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Edit Job Application
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Update the details for {(result.job as any).company} — {(result.job as any).position}
        </p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <JobForm mode="edit" initialData={result.job} />
      </div>
    </div>
  );
}
