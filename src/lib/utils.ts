import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return "";

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatStatus(status: string): { color: string; dot: string } {
  const normalized = status?.toLowerCase() || "";

  const statusStyles: Record<string, { color: string; dot: string }> = {
    applied: {
      color: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    interview: {
      color: "text-purple-600 dark:text-purple-400",
      dot: "bg-purple-500",
    },
    rejected: {
      color: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    },
    offer: {
      color: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
  };

  return (
    statusStyles[normalized] || {
      color: "text-zinc-600 dark:text-zinc-400",
      dot: "bg-zinc-500",
    }
  );
}
