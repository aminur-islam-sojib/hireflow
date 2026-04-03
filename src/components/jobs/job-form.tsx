/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/components/providers/toast-provider";
import { createJobAction, updateJobAction } from "@/lib/actions/job-actions";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

type JobFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
  job?: unknown;
};

type JobFormProps = {
  mode?: "create" | "edit";
  initialData?: JobFormState["job"] & { _id?: string };
  onSuccess?: () => void | Promise<void>;
  onCancel?: () => void;
};

const defaultFormValues = {
  company: "",
  position: "",
  positionType: "Remote",
  url: "",
  cvUrl: "",
  status: "Applied",
  appliedDate: new Date().toISOString().split("T")[0],
  notes: "",
  tags: "",
  interviewDate: "",
  interviewType: "",
  interviewLink: "",
};

export function JobForm({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
}: JobFormProps) {
  const actionFn = mode === "edit" ? updateJobAction : createJobAction;
  const [state, action, pending] = useActionState<JobFormState, FormData>(
    actionFn,
    {},
  );
  const router = useRouter();
  const { toast } = useToast();

  const defaults = initialData
    ? {
        company: (initialData as any).company ?? "",
        position: (initialData as any).position ?? "",
        positionType: (initialData as any).positionType ?? "Remote",
        url: (initialData as any).url ?? "",
        cvUrl: (initialData as any).cvUrl ?? "",
        status: (initialData as any).status ?? "Applied",
        appliedDate: (initialData as any).appliedDate
          ? new Date((initialData as any).appliedDate)
              .toISOString()
              .split("T")[0]
          : defaultFormValues.appliedDate,
        notes: (initialData as any).notes ?? "",
        tags: ((initialData as any).tags ?? []).join(", "),
        interviewDate: (initialData as any).interview?.date
          ? new Date((initialData as any).interview.date)
              .toISOString()
              .split("T")[0]
          : "",
        interviewType: (initialData as any).interview?.type ?? "",
        interviewLink: (initialData as any).interview?.link ?? "",
      }
    : defaultFormValues;

  const [appliedDate, setAppliedDate] = useState<Date | undefined>(() => {
    if (!defaults.appliedDate) return undefined;
    const parsed = new Date(defaults.appliedDate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  });

  const [interviewDate, setInterviewDate] = useState<Date | undefined>(() => {
    if (!defaults.interviewDate) return undefined;
    const parsed = new Date(defaults.interviewDate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  });

  useEffect(() => {
    if (state?.error) {
      toast(state.error, "error");
    }
    if (state?.success) {
      toast(
        mode === "edit" ? "Job updated successfully" : "Job added successfully",
      );
      if (onSuccess) {
        void onSuccess();
      } else {
        router.push("/dashboard/jobs");
        router.refresh();
      }
    }
  }, [state, mode, router, toast, onSuccess]);

  return (
    <form action={action} className="space-y-4">
      {mode === "edit" && initialData && (initialData as any)?._id && (
        <input type="hidden" name="jobId" value={(initialData as any)._id} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            name="company"
            defaultValue={defaults.company}
            placeholder="Acme Inc."
            required
          />
          {state?.fieldErrors?.company && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.company}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position *</Label>
          <Input
            id="position"
            name="position"
            defaultValue={defaults.position}
            placeholder="Frontend Developer"
            required
          />
          {state?.fieldErrors?.position && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.position}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Position Type */}
        <div className="space-y-2">
          <Label>Position Type</Label>
          <Select name="positionType" defaultValue={defaults.positionType}>
            {/* Set h-10 to match standard shadcn input height */}
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Onsite">Onsite</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select name="status" defaultValue={defaults.status}>
            {/* Set h-10 and removed h-full which can cause issues in grid */}
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Application Date */}
        <div className=" flex flex-col">
          <label htmlFor="appliedDate" className="text-sm ">
            Application Date <span className="text-destructive">*</span>
          </label>

          {/* Hidden input ensures server action receives yyyy-mm-dd */}
          <input
            type="hidden"
            name="appliedDate"
            value={appliedDate ? format(appliedDate, "yyyy-MM-dd") : ""}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                className={cn(
                  "w-full justify-start text-left font-normal h-9 py-0 px-2 border border-input bg-background hover:bg-accent",
                  !appliedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                {appliedDate ? (
                  format(appliedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto " align="start">
              <Calendar
                mode="single"
                selected={appliedDate}
                onSelect={setAppliedDate}
                initialFocus
                className="rounded-md border shadow-md bg-popover"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">Job URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={defaults.url}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">Cv URL</Label>
        <Input
          id="cvUrl"
          name="cvUrl"
          type="cvUrl"
          defaultValue={defaults.cvUrl}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults.tags}
          placeholder="Remote, Urgent, Startup"
        />
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Interview Details (optional)
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="interviewDate">Interview Date</Label>
            <input
              type="hidden"
              name="interviewDate"
              value={interviewDate ? format(interviewDate, "yyyy-MM-dd") : ""}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 py-0 px-3 border border-input bg-background hover:bg-accent",
                    !interviewDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  {interviewDate ? (
                    format(interviewDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={interviewDate}
                  onSelect={setInterviewDate}
                  initialFocus
                  className="rounded-md border shadow-md bg-popover"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select name="interviewType" defaultValue={defaults.interviewType}>
              <SelectTrigger className="w-full py-5 h-10 justify-start text-left font-normal">
                <SelectValue className="w-full" placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select type</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="interviewLink">Meeting Link</Label>
            <Input
              id="interviewLink"
              name="interviewLink"
              type="url"
              defaultValue={defaults.interviewLink}
              placeholder="https://meet.google.com/..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaults.notes}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update Job"
              : "Add Job"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
