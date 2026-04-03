import nodemailer from "nodemailer";

const enabled = process.env.EMAIL_NOTIFICATIONS_ENABLED === "true";

const transporter = enabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter || !enabled || !process.env.SMTP_USER) {
    console.log("[Mail]", "Email disabled or not configured — skipping send to", to);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "JobTrackr",
      to,
      subject,
      html,
    });
    console.log("[Mail]", "Sent to", to, "—", subject);
  } catch (err) {
    console.error("[Mail] Failed to send to", to, err);
  }
}

export function buildInterviewReminderEmail(job: { company: string; position: string; interviewDate: Date }) {
  return {
    subject: `Interview Reminder: ${job.position} at ${job.company}`,
    html: `
      <h2>Upcoming Interview Reminder</h2>
      <p>You have an interview scheduled <strong>tomorrow</strong>:</p>
      <ul>
        <li><strong>Company:</strong> ${job.company}</li>
        <li><strong>Position:</strong> ${job.position}</li>
        <li><strong>Date:</strong> ${job.interviewDate.toLocaleDateString()}</li>
      </ul>
      <p>Good luck!</p>
    `,
  };
}

export function buildFollowUpReminderEmail(job: { company: string; position: string; appliedDate: Date }) {
  return {
    subject: `Follow Up: ${job.position} at ${job.company}`,
    html: `
      <h2>Follow-Up Reminder</h2>
      <p>You applied to <strong>${job.company}</strong> for <strong>${job.position}</strong> on ${job.appliedDate.toLocaleDateString()} and haven't heard back.</p>
      <p>Consider sending a follow-up email to check on the status of your application.</p>
    `,
  };
}

export function buildWeeklySummaryEmail(stats: { total: number; applied: number; interview: number; rejected: number; offer: number }) {
  return {
    subject: "JobTrackr Weekly Summary",
    html: `
      <h2>Weekly Application Summary</h2>
      <ul>
        <li>Total: ${stats.total}</li>
        <li>Applied: ${stats.applied}</li>
        <li>Interviews: ${stats.interview}</li>
        <li>Offers: ${stats.offer}</li>
        <li>Rejected: ${stats.rejected}</li>
      </ul>
    `,
  };
}
