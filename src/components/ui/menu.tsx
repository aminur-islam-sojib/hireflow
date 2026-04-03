import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type MenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  dangerous?: boolean;
  className?: string;
};

export const DropdownMenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ className, dangerous, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
          dangerous && "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

DropdownMenuItem.displayName = "DropdownMenuItem";
