"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { createJobAction, updateJobAction } from "@/lib/actions/job-actions";
import { cn } from "@/lib/utils";

type JobFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
  job?: unknown;
};

type JobFormProps = {
  mode?: "create" | "edit";
  initialData?: JobFormState["job"] & { _id?: string };
};

const defaultFormValues = {
  company: "",
  position: "",
  positionType: "Remote",
  url: "",
  status: "Applied",
  appliedDate: new Date().toISOString().split("T")[0],
  notes: "",
  tags: "",
  interviewDate: "",
  interviewType: "",
  interviewLink: "",
};

export function JobForm({ mode = "create", initialData }: JobFormProps) {
  const actionFn = mode === "edit" ? updateJobAction : createJobAction;
  const [state, action, pending] = useActionState<JobFormState, FormData>(actionFn, {});
  const router = useRouter();
  const { toast } = useToast();

  const defaults = initialData
    ? {
        company: (initialData as any).company ?? "",
        position: (initialData as any).position ?? "",
        positionType: (initialData as any).positionType ?? "Remote",
        url: (initialData as any).url ?? "",
        status: (initialData as any).status ?? "Applied",
        appliedDate: (initialData as any).appliedDate
          ? new Date((initialData as any).appliedDate).toISOString().split("T")[0]
          : defaultFormValues.appliedDate,
        notes: (initialData as any).notes ?? "",
        tags: ((initialData as any).tags ?? []).join(", "),
        interviewDate: (initialData as any).interview?.date
          ? new Date((initialData as any).interview.date).toISOString().split("T")[0]
          : "",
        interviewType: (initialData as any).interview?.type ?? "",
        interviewLink: (initialData as any).interview?.link ?? "",
      }
    : defaultFormValues;

  useEffect(() => {
    if (state?.error) {
      toast(state.error, "error");
    }
    if (state?.success) {
      toast(mode === "edit" ? "Job updated successfully" : "Job added successfully");
      router.push("/dashboard/jobs");
      router.refresh();
    }
  }, [state, mode, router, toast]);

  return (
    <form action={action} className="space-y-4">
      {mode === "edit" && initialData && (initialData as any)?._id && (
        <input type="hidden" name="jobId" value={(initialData as any)._id} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Company *"
          name="company"
          defaultValue={defaults.company}
          placeholder="Acme Inc."
          required
          error={state?.fieldErrors?.company}
        />
        <Input
          label="Position *"
          name="position"
          defaultValue={defaults.position}
          placeholder="Frontend Developer"
          required
          error={state?.fieldErrors?.position}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label="Position Type"
          name="positionType"
          defaultValue={defaults.positionType}
          options={[
            { value: "Remote", label: "Remote" },
            { value: "Onsite", label: "Onsite" },
            { value: "Hybrid", label: "Hybrid" },
          ]}
        />
        <Select
          label="Status"
          name="status"
          defaultValue={defaults.status}
          options={[
            { value: "Applied", label: "Applied" },
            { value: "Interview", label: "Interview" },
            { value: "Rejected", label: "Rejected" },
            { value: "Offer", label: "Offer" },
          ]}
        />
        <Input
          label="Application Date"
          name="appliedDate"
          type="date"
          defaultValue={defaults.appliedDate}
        />
      </div>

      <Input
        label="Job URL"
        name="url"
        type="url"
        defaultValue={defaults.url}
        placeholder="https://..."
      />

      <Input
        label="Tags"
        name="tags"
        defaultValue={defaults.tags}
        placeholder="Remote, Urgent, Startup"
      />

      {/* Interview Details */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Interview Details (optional)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Interview Date"
            name="interviewDate"
            type="date"
            defaultValue={defaults.interviewDate}
          />
          <Select
            label="Interview Type"
            name="interviewType"
            defaultValue={defaults.interviewType}
            options={[
              { value: "", label: "Select type" },
              { value: "Online", label: "Online" },
              { value: "Onsite", label: "Onsite" },
            ]}
          />
          <Input
            label="Meeting Link"
            name="interviewLink"
            type="url"
            defaultValue={defaults.interviewLink}
            placeholder="https://meet.google.com/..."
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaults.notes}
          placeholder="Any additional notes..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update Job"
              : "Add Job"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            mode === "edit" ? router.push("/dashboard/jobs") : router.back()
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}