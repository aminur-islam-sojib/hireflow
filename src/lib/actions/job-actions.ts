"use server";

import { auth } from "@/lib/auth";
import { collections, connectDB, dbConnect, toObjectId } from "@/lib/dbConnect";
import { jobSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// -- Job CRUD --

export async function createJobAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData.entries());

  const tags =
    typeof raw.tags === "string"
      ? raw.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

  const parsed = jobSchema.safeParse({
    company: raw.company,
    position: raw.position,
    positionType: raw.positionType || "Remote",
    url: raw.url || "",
    status: raw.status || "Applied",
    appliedDate: raw.appliedDate || new Date().toISOString().split("T")[0],
    notes: raw.notes || "",
    tags,
    bookmarked: false,
    interview: {
      date: raw.interviewDate || undefined,
      type: raw.interviewType || undefined,
      link: raw.interviewLink || "",
    },
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      parsed.error.flatten().fieldErrors,
    )) {
      const path = key.split(".").pop()!;
      if (value?.[0]) fieldErrors[path] = value[0];
    }
    return { error: "Validation failed", fieldErrors };
  }

  try {
    await connectDB();
    const jobs = dbConnect(collections.JOBS);
    const now = new Date();

    await jobs.insertOne({
      ...parsed.data,
      userId: toObjectId(session.user.id),
      interview: parsed.data.interview
        ? {
            date: parsed.data.interview.date
              ? new Date(parsed.data.interview.date)
              : undefined,
            type: parsed.data.interview.type,
            link: parsed.data.interview.link,
          }
        : undefined,
      appliedDate: new Date(parsed.data.appliedDate),
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err) {
    console.error("[createJobAction]", err);
    return { error: "Failed to create job application" };
  }
}

export async function updateJobAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const jobId = formData.get("jobId") as string;
  if (!jobId) return { error: "Job ID is required" };

  const raw = Object.fromEntries(formData.entries());

  const tags =
    typeof raw.tags === "string"
      ? raw.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

  const parsed = jobSchema.safeParse({
    company: raw.company,
    position: raw.position,
    positionType: raw.positionType || "Remote",
    url: raw.url || "",
    status: raw.status || "Applied",
    appliedDate: raw.appliedDate || new Date().toISOString().split("T")[0],
    notes: raw.notes || "",
    tags,
    interview: {
      date: raw.interviewDate || undefined,
      type: raw.interviewType || undefined,
      link: raw.interviewLink || "",
    },
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      parsed.error.flatten().fieldErrors,
    )) {
      const path = key.split(".").pop()!;
      if (value?.[0]) fieldErrors[path] = value[0];
    }
    return { error: "Validation failed", fieldErrors };
  }

  try {
    await connectDB();
    const jobs = dbConnect(collections.JOBS);

    const result = await jobs.updateOne(
      {
        _id: toObjectId(jobId),
        userId: toObjectId(session.user.id),
      },
      {
        $set: {
          ...parsed.data,
          interview: {
            date: parsed.data.interview?.date
              ? new Date(parsed.data.interview.date)
              : undefined,
            type: parsed.data.interview?.type,
            link: parsed.data.interview?.link,
          },
          appliedDate: new Date(parsed.data.appliedDate),
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) return { error: "Job not found" };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err) {
    console.error("[updateJobAction]", err);
    return { error: "Failed to update job application" };
  }
}

export async function deleteJobAction(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const jobs = dbConnect(collections.JOBS);

    const result = await jobs.findOneAndDelete({
      _id: toObjectId(jobId),
      userId: toObjectId(session.user.id),
    });

    if (!result) return { error: "Job not found" };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err) {
    console.error("[deleteJobAction]", err);
    return { error: "Failed to delete job application" };
  }
}

export async function getJobByIdAction(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", job: null };

  try {
    await connectDB();
    const jobs = dbConnect(collections.JOBS);

    const job = await jobs.findOne({
      _id: toObjectId(jobId),
      userId: toObjectId(session.user.id),
    });

    const normalizedJob = job
      ? {
          ...job,
          _id: String(job._id),
          userId: job.userId ? String(job.userId) : job.userId,
        }
      : null;

    return { success: true, job: normalizedJob };
  } catch (err) {
    console.error("[getJobByIdAction]", err);
    return { error: "Failed to fetch job", job: null };
  }
}

export async function updateJobStatusAction(jobId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectDB();
    const jobs = dbConnect(collections.JOBS);

    await jobs.updateOne(
      {
        _id: toObjectId(jobId),
        userId: toObjectId(session.user.id),
      },
      { $set: { status, updatedAt: new Date() } },
    );

    revalidatePath("/dashboard/kanban");
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (err) {
    console.error("[updateJobStatusAction]", err);
    return { error: "Failed to update status" };
  }
}
