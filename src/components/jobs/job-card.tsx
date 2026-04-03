"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { GripVertical, CalendarDays } from "lucide-react";

type JobCardProps = {
  job: {
    _id: string;
    company: string;
    position: string;
    appliedDate: string;
    positionType: string;
    tags?: string[];
  };
};

export function JobCard({ job }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-0.5 cursor-grab text-zinc-400">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {job.company}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{job.position}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <CalendarDays className="h-3 w-3" />
            {formatDate(job.appliedDate)}
          </div>
          {job.positionType && (
            <span className="mt-1 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
              {job.positionType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
