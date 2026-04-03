import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mt-6 flex flex-col gap-4">
        <div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="mt-2 h-10 w-full animate-pulse rounded bg-zinc-300 dark:bg-zinc-600" />
      </div>
    </div>
  );
}
