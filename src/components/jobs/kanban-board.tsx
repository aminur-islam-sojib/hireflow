"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSwappingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { JobCard } from "@/components/jobs/job-card";
import { useToast } from "@/components/providers/toast-provider";
import { updateJobStatusAction } from "@/lib/actions/job-actions";
import { Briefcase, CalendarDays, XCircle, Star, Plus } from "lucide-react";

type KanbanBoardProps = {
  columns: {
    status: string;
    label: string;
    jobs: Record<string, unknown>[];
  }[];
};

type ColumnType = {
  status: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
};

export function KanbanBoard({ columns: initialColumns }: KanbanBoardProps) {
  const { toast } = useToast();
  const [columns, setColumns] = useState<Record<string, ColumnType>>(() => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Applied: Briefcase,
      Interview: CalendarDays,
      Rejected: XCircle,
      Offer: Star,
    };
    const map: Record<string, ColumnType> = {};
    for (const col of initialColumns) {
      map[col.status] = {
        status: col.status,
        label: col.label,
        icon: icons[col.status] || Briefcase,
        items: col.jobs.map((j: any) => j._id as string),
      };
    }
    return map;
  });

  // Track job data for overlay
  const [jobMap, setJobMap] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    for (const col of initialColumns) {
      for (const job of col.jobs) {
        (job as any) && setJobMap((m) => ({ ...m, [(job as any)._id]: job }));
        map[(job as any)._id] = job;
      }
    }
    return map;
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeColumn = Object.keys(columns).find((key) => columns[key].items.includes(active.id as string));
    const overColumn = Object.keys(columns).find((key) => columns[key].items.includes(over.id as string));

    if (!activeColumn || !overColumn) return;

    let nextColumns = { ...columns };

    // Clone arrays to avoid mutation
    const activeList = [...nextColumns[activeColumn].items];
    const overList = [...nextColumns[overColumn].items];
    const activeIndex = activeList.indexOf(active.id as string);
    const overIndex = overList.indexOf(over.id as string);

    // Remove from source
    activeList.splice(activeIndex, 1);

    if (activeColumn === overColumn) {
      // Insert into same column
      activeList.splice(overIndex, 0, active.id as string);
      nextColumns[activeColumn] = { ...nextColumns[activeColumn], items: activeList };
    } else {
      overList.splice(overIndex + 1, 0, active.id as string);
      nextColumns[activeColumn] = { ...nextColumns[activeColumn], items: activeList };
      nextColumns[overColumn] = { ...nextColumns[overColumn], items: overList };

      // Update status in DB
      const result = await updateJobStatusAction(active.id as string, overColumn);
      if (result?.error) {
        toast("Failed to update status", "error");
        setColumns(columns); // rollback
        return;
      }
    }

    setColumns(nextColumns);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  const columnIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Applied: Briefcase,
    Interview: CalendarDays,
    Rejected: XCircle,
    Offer: Star,
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.values(columns).map((column) => {
          const Icon = columnIcons[column.status] || Briefcase;
          return (
            <div
              key={column.status}
              className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <Icon className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {column.label}
                </span>
                <span className="ml-auto text-xs text-zinc-400">{column.items.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <SortableContext items={column.items} strategy={verticalListSortingStrategy}>
                  {column.items.map((jobId) => {
                    const job = jobMap[jobId];
                    if (!job) return null;
                    return <JobCard key={jobId} job={job as any} />;
                  })}
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && jobMap[activeId] ? (
          <JobCard job={jobMap[activeId] as any} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}