"use server";

import { hash } from "bcryptjs";
import { collections, connectDB, dbConnect } from "@/lib/dbConnect";
import { registerSchema } from "@/lib/validations";

type RegisterResult = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

export async function registerAction(
  prevState: unknown,
  formData: FormData,
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
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
    await connectDB();
    const users = dbConnect(collections.USERS);
    const normalizedEmail = parsed.data.email.toLowerCase();

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const hashed = await hash(parsed.data.password, 10);
    await users.insertOne({
      name: parsed.data.name,
      email: normalizedEmail,
      password: hashed,
    });

    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
