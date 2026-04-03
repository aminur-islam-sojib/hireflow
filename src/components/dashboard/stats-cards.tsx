"use client";

import { Briefcase, Mail, CalendarDays, XCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  total: number;
  applied: number;
  interview: number;
  rejected: number;
  offer: number;
};

export function StatsCards({ total, applied, interview, rejected, offer }: StatsCardsProps) {
  const cards = [
    { label: "Total Applications", count: total, icon: Briefcase, color: "text-zinc-900 dark:text-zinc-100" },
    { label: "Applied", count: applied, icon: Mail, color: "text-blue-600 dark:text-blue-400" },
    { label: "Interview", count: interview, icon: CalendarDays, color: "text-amber-600 dark:text-amber-400" },
    { label: "Rejected", count: rejected, icon: XCircle, color: "text-red-600 dark:text-red-400" },
    { label: "Offers", count: offer, icon: Star, color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
          )}
        >
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800", card.color)}>
            <card.icon className="h-5 w-5" />
          </div>
          <div>
            <p className={cn("text-2xl font-bold", card.color)}>{card.count}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
