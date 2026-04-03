"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerAction } from "@/lib/actions/auth-actions";


const initialState = { error: "", fieldErrors: {} };

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/login?registered=1");
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-zinc-900 underline decoration-zinc-400 underline-offset-4 dark:text-zinc-100">
          Sign in
        </Link>
      </p>

      {state?.error && !state.fieldErrors && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </div>
      )}

      <form action={action} className="mt-6 flex flex-col gap-4">
        <Input
          label="Name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          error={state?.fieldErrors?.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
          error={state?.fieldErrors?.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
          error={state?.fieldErrors?.password}
        />
        <Button type="submit" className="mt-2" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}
