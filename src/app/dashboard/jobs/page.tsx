"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { JobForm } from "@/components/jobs/job-form";
import { SearchFilter } from "@/components/jobs/search-filter";
import { ExportCSV } from "@/components/jobs/export-csv";
import { deleteJobAction } from "@/lib/actions/job-actions";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { Plus, Pencil, Trash2, BookmarkCheck } from "lucide-react";

type Job = {
  _id: string;
  company: string;
  position: string;
  positionType: string;
  status: string;
  appliedDate: string;
  url: string;
  tags: string[];
  bookmarked: boolean;
  notes: string;
  interview?: { date?: string; type?: string; link?: string };
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      status,
      sort,
      limit: "50",
    });
    const res = await fetch(`/api/jobs?${params}`);
    const json = await res.json();
    setJobs(json.jobs || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [search, status, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (value: string) => setSearch(value);
  const handleStatusChange = (value: string) => setStatus(value);
  const handleSortChange = (value: string) => setSort(value);

  async function handleDelete(id: string) {
    const result = await deleteJobAction(id);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Job deleted");
      fetchJobs();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {total} application{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCSV />
          <Button size="sm" onClick={() => setShowNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      <SearchFilter
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          Loading...
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            No job applications found
          </p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setShowNewDialog(true)}
          >
            Add your first job
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* Desktop Table */}
          <table className="hidden min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 sm:table">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Tags
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {jobs.map((job) => (
                <tr
                  key={job._id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      {job.bookmarked && (
                        <BookmarkCheck className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      {job.url ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {job.company}
                        </a>
                      ) : (
                        job.company
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {job.position}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(job.appliedDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {(job.tags || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="mr-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/jobs/${job._id}`}
                        className="rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="rounded p-1 text-zinc-500 hover:bg-red-50 dark:text-zinc-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {jobs.map((job) => (
              <div key={job._id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {job.bookmarked && (
                      <BookmarkCheck className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {job.company}
                    </span>
                  </div>
                  <Badge status={job.status} />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {job.position}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {formatDate(job.appliedDate)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/jobs/${job._id}`}
                      className="text-zinc-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="text-zinc-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        title="Add Job Application"
      >
        <JobForm mode="create" />
      </Dialog>
    </div>
  );
}
