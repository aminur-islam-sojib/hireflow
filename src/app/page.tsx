import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Briefcase, CalendarCheck, BarChart3, Bell, Download } from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Visual overview of your job search with charts and stats at a glance.",
  },
  {
    icon: Briefcase,
    title: "Track Applications",
    description: "Add and manage all your job applications with status, notes, and tags.",
  },
  {
    icon: CalendarCheck,
    title: "Interview Tracking",
    description: "Keep details organized — date, type, and meeting links for every interview.",
  },
  {
    icon: BarChart3,
    title: "Kanban Board",
    description: "Drag-and-drop your applications through the pipeline visually.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Automated email alerts for upcoming interviews and follow-up reminders.",
  },
  {
    icon: Download,
    title: "CSV Export",
    description: "Export your entire application history as a CSV file with one click.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            JobTrackr
          </span>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button asChild variant="primary">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild variant="primary">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center md:py-36">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl lg:text-6xl">
          Stop losing track of your
          <br />
          <span className="text-zinc-500">job applications.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
          A clean, modern tool to track where you&apos;ve applied, manage interviews,
          and stay organized throughout your job search.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {isLoggedIn ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/register">Start Tracking — Free</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <feature.icon className="mb-4 h-6 w-6 text-zinc-500" />
              <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        Built with Next.js, MongoDB, and Tailwind CSS.
      </footer>
    </div>
  );
}
