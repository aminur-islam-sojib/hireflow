"use client";

import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown";
import { DropdownMenuItem } from "@/components/ui/menu";
import { useTheme } from "@/components/providers/theme-provider";
import { signOut } from "next-auth/react";
import { Moon, Sun, UserIcon, LogOut } from "lucide-react";

export function DashboardHeader({
  user,
}: {
  user?: { name?: string | null; email?: string | null };
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  return (
    <header className="flex h-16 items-center justify-end border-b border-zinc-200 px-6 dark:border-zinc-800 gap-4">
      <button
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <Dropdown
        trigger={
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </button>
        }
      >
        <div className="px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {user?.name}
        </div>
        <div className="px-3 pb-2 text-xs text-zinc-500 dark:text-zinc-400">
          {user?.email}
        </div>
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
          <UserIcon className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          dangerous
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </Dropdown>
    </header>
  );
}
