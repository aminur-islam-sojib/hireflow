import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const jobSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  positionType: z.enum(["Remote", "Onsite", "Hybrid"]).default("Remote"),
  url: z.string().url().or(z.literal("")).default(""),
  status: z.enum(["Applied", "Interview", "Rejected", "Offer"]).default("Applied"),
  appliedDate: z.string().or(z.date()).default(new Date().toISOString().split("T")[0]),
  notes: z.string().max(1000).default(""),
  tags: z.array(z.string()).default([]).optional(),
  bookmarked: z.boolean().default(false).optional(),
  interview: z
    .object({
      date: z.string().or(z.date()).optional().nullable(),
      type: z.enum(["Online", "Onsite"]).optional().nullable(),
      link: z.string().url().or(z.literal("")).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  emailPrefs: z.object({
    interviewReminders: z.boolean().optional().default(true),
    followUpReminders: z.boolean().optional().default(true),
    weeklySummary: z.boolean().optional().default(true),
  }),
});
