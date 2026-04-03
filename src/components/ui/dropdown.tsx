"use client";

import { cn } from "@/lib/utils";
import { type MouseEventHandler, type PropsWithChildren, useRef, useState } from "react";

type DropdownProps = PropsWithChildren<{
  trigger: React.ReactNode;
  className?: string;
}>;

export function Dropdown({ trigger, children, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleClick: MouseEventHandler = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block" onMouseDown={handleClick}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute right-0 z-50 mt-1 min-w-[160px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
