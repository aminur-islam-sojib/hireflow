"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import {
  type ProfileActionState,
  updateProfileAction,
} from "@/lib/actions/profile-actions";

const defaultEmailPrefs = {
  interviewReminders: true,
  followUpReminders: true,
  weeklySummary: true,
};

type ProfileState = ProfileActionState;

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {},
  );
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [emailPrefs, setEmailPrefs] = useState(defaultEmailPrefs);
  const awaitingSubmitResultRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as {
          profile?: {
            name?: string;
            emailPrefs?: Partial<typeof defaultEmailPrefs>;
          };
        };

        if (!mounted || !data.profile) return;

        setName(data.profile.name ?? "");
        setEmailPrefs({
          ...defaultEmailPrefs,
          ...data.profile.emailPrefs,
        });
      } catch {
        // Keep UI usable with defaults even if profile prefetch fails.
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (pending) return;
    if (!awaitingSubmitResultRef.current) return;

    awaitingSubmitResultRef.current = false;

    if (state?.error) {
      toast(state.error, "error");
      return;
    }

    if (state?.success) {
      toast("Profile updated");
      const nextName = state.name ?? name;
      void updateSession({ name: nextName });
    }
  }, [name, pending, state, toast, updateSession]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    awaitingSubmitResultRef.current = true;
    const formData = new FormData(e.currentTarget);
    formData.set("name", name);
    formData.set("interviewReminders", String(emailPrefs.interviewReminders));
    formData.set("followUpReminders", String(emailPrefs.followUpReminders));
    formData.set("weeklySummary", String(emailPrefs.weeklySummary));
    startTransition(() => action(formData));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Profile
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account and notification preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {/* Profile Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Account
            </h2>
            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              name="email"
              value={session?.user?.email ?? ""}
              disabled
              className="bg-zinc-50 dark:bg-zinc-800"
            />
          </div>

          {/* Email Preferences */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Email Notifications
            </h2>

            {(
              [
                "interviewReminders",
                "followUpReminders",
                "weeklySummary",
              ] as const
            ).map((key) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {key === "interviewReminders"
                      ? "Get notified 24h before a scheduled interview"
                      : key === "followUpReminders"
                        ? "Reminded if no response after 7 days"
                        : "Receive a weekly summary of your application stats"}
                  </p>
                </div>
                <input
                  type="hidden"
                  name={key}
                  value={String(emailPrefs[key])}
                />
                <button
                  type="button"
                  onClick={() =>
                    setEmailPrefs((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailPrefs[key]
                      ? "bg-zinc-900 dark:bg-white"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:bg-zinc-900 ${
                      emailPrefs[key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
