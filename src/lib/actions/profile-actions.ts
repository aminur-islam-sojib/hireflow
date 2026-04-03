"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";
import {
  type EmailPrefs,
  updateUserProfileById,
} from "@/lib/services/profile-service";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
  name?: string;
  emailPrefs?: EmailPrefs;
};

export async function updateProfileAction(
  _prevState: unknown,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    emailPrefs: {
      interviewReminders: formData.get("interviewReminders") === "true",
      followUpReminders: formData.get("followUpReminders") === "true",
      weeklySummary: formData.get("weeklySummary") === "true",
    },
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      parsed.error.flatten().fieldErrors,
    )) {
      if (value?.[0]) fieldErrors[key] = value[0];
    }
    return { error: "Validation failed", fieldErrors };
  }

  try {
    const updated = await updateUserProfileById(session.user.id, parsed.data);
    if (!updated) return { error: "User not found" };

    revalidatePath("/dashboard/profile");
    return {
      success: true,
      name: updated.name,
      emailPrefs: updated.emailPrefs,
    };
  } catch (err) {
    console.error("[updateProfileAction]", err);
    return { error: "Failed to update profile" };
  }
}
