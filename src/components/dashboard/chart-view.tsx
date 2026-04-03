"use client";

import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

type ChartViewProps = {
  statusData: { name: string; count: number }[];
  trendData: { name: string; count: number }[];
};

export function ChartView({ statusData, trendData }: ChartViewProps) {
  const lightStyle = {
    cursor: { fill: "#f4f4f5" },
    contentStyle: {
      background: "#fff",
      border: "1px solid #e4e4e7",
      borderRadius: "8px",
      color: "#18181b",
      fontSize: "12px",
    },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Status Breakdown */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Applications by Status
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.4} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#71717a" }} />
            <Tooltip cursor={lightStyle.cursor} contentStyle={lightStyle.contentStyle} />
            <Bar dataKey="count" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Applications by Week
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.4} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#71717a" }} />
            <Tooltip cursor={lightStyle.cursor} contentStyle={lightStyle.contentStyle} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6366f1" }}
              activeDot={{ r: 6, fill: "#6366f1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}