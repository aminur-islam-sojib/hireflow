"use client";

import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { updateProfileAction } from "@/lib/actions/job-actions";

type ProfileState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfileAction, {});
  const { toast } = useToast();
  const [emailPrefs, setEmailPrefs] = useState({
    interviewReminders: true,
    followUpReminders: true,
    weeklySummary: true,
  });

  useEffect(() => {
    if (state?.error) toast(state.error, "error");
    if (state?.success) toast("Profile updated");
  }, [state, toast]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Add checkbox values
    formData.set("interviewReminders", String(emailPrefs.interviewReminders));
    formData.set("followUpReminders", String(emailPrefs.followUpReminders));
    formData.set("weeklySummary", String(emailPrefs.weeklySummary));
    action(formData);
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
              defaultValue={session?.user?.name ?? ""}
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

            {[
              { key: "interviewReminders", label: "Interview Reminders", desc: "Get notified 24h before a scheduled interview" },
              { key: "followUpReminders", label: "Follow-Up Reminders", desc: "Reminded if no response after 7 days" },
              { key: "weeklySummary", label: "Weekly Summary", desc: "Receive a weekly summary of your application stats" },
            ].map((pref) => (
              <label key={pref.key} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{pref.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{pref.desc}</p>
                </div>
                <input
                  type="hidden"
                  name={pref.key}
                  value={String(emailPrefs[pref.key as keyof typeof emailPrefs])}
                />
                <button
                  type="button"
                  onClick={() =>
                    setEmailPrefs((prev) => ({
                      ...prev,
                      [pref.key]: !prev[pref.key as keyof typeof prev],
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailPrefs[pref.key as keyof typeof emailPrefs]
                      ? "bg-zinc-900 dark:bg-white"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:bg-zinc-900 ${
                      emailPrefs[pref.key as keyof typeof emailPrefs] ? "translate-x-6" : "translate-x-1"
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
