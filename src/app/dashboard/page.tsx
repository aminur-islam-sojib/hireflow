import { auth } from "@/lib/auth";
import { collections, connectDB, dbConnect, toObjectId } from "@/lib/dbConnect";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChartView } from "@/components/dashboard/chart-view";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  let dashboardDataUnavailable = false;

  let stats = { total: 0, applied: 0, interview: 0, rejected: 0, offer: 0 };
  let statusData = [
    { name: "Applied", count: 0 },
    { name: "Interview", count: 0 },
    { name: "Rejected", count: 0 },
    { name: "Offer", count: 0 },
  ];
  let trendData: { name: string; count: number }[] = [];

  if (userId) {
    try {
      await connectDB();
      const jobs = dbConnect(collections.JOBS);

      const counts = await jobs
        .aggregate<{
          _id: string;
          count: number;
        }>([{ $match: { userId: toObjectId(userId) } }, { $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray();

      const total = counts.reduce(
        (sum: number, c: { count: number }) => sum + c.count,
        0,
      );

      statusData = statusData.map((sd) => {
        const match = counts.find((c: { _id: string }) => c._id === sd.name);
        return { ...sd, count: match ? match.count : 0 };
      });

      stats = {
        total,
        applied: statusData[0].count,
        interview: statusData[1].count,
        rejected: statusData[2].count,
        offer: statusData[3].count,
      };

      // Weekly trend: last 12 weeks — group by week start date
      const twelveWeeksAgo = new Date();
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

      const weekly = await jobs
        .aggregate<{ _id: string; count: number }>([
          {
            $match: {
              userId: toObjectId(userId),
              createdAt: { $gte: twelveWeeksAgo },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      // Bucket into weeks
      const weekMap = new Map<string, number>();
      weekly.forEach((w: { _id: string; count: number }) => {
        const d = new Date(w._id + "T00:00:00");
        const dayOfWeek = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
        const key = monday.toISOString().split("T")[0];
        weekMap.set(key, (weekMap.get(key) || 0) + w.count);
      });

      trendData = Array.from(weekMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([date, count]) => ({
          name: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          count,
        }));

      if (trendData.length === 0) {
        trendData = [{ name: "No data", count: 0 }];
      }
    } catch (error) {
      dashboardDataUnavailable = true;
      console.error(
        "[Dashboard] Failed to load stats:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Overview of your job search progress
        </p>
      </div>

      {dashboardDataUnavailable ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
          Live dashboard data is temporarily unavailable. Check your database
          connection and try again.
        </div>
      ) : null}

      <StatsCards {...stats} />
      <ChartView statusData={statusData} trendData={trendData} />
    </div>
  );
}
