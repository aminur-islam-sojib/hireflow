import { cn } from "@/lib/utils";
import { formatStatus } from "@/lib/utils";

type BadgeProps = {
  status: string;
  className?: string;
  size?: "sm" | "md";
};

export function Badge({ status, className, size = "sm" }: BadgeProps) {
  const style = formatStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        "bg-zinc-100 dark:bg-zinc-800",
        style.color,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  );
}
