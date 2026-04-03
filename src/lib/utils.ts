export function cn(...inputs: (string | undefined | null | false)[]): string {
  const result: string[] = [];
  for (const input of inputs) {
    if (typeof input === "string") {
      result.push(input);
    }
  }
  return result.join(" ");
}

export function formatStatus(status: string): { color: string; dot: string } {
  const map: Record<string, { color: string; dot: string }> = {
    Applied: { color: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
    Interview: { color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
    Rejected: { color: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
    Offer: { color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  };
  return map[status] ?? { color: "text-gray-600 dark:text-gray-400", dot: "bg-gray-500" };
}

export function daysBetween(d1: Date, d2: Date) {
  const ms = 1000 * 60 * 60 * 24;
  return Math.round((d2.getTime() - d1.getTime()) / ms);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
