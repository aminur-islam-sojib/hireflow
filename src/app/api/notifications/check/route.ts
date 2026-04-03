import { NextRequest, NextResponse } from "next/server";
import { collections, connectDB, dbConnect } from "@/lib/dbConnect";
import {
  sendEmail,
  buildInterviewReminderEmail,
  buildFollowUpReminderEmail,
  buildWeeklySummaryEmail,
} from "@/lib/mail";

type UserDoc = {
  _id: { toString(): string };
  email: string;
  emailPrefs?: {
    interviewReminders?: boolean;
    followUpReminders?: boolean;
    weeklySummary?: boolean;
  };
};

type JobWithUser = {
  company: string;
  position: string;
  interview?: { date?: Date };
  createdAt: Date;
  userId?: { toString(): string };
  user: UserDoc;
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action") || "all";

  await connectDB();
  const users = dbConnect<UserDoc>(collections.USERS);
  const jobs = dbConnect(collections.JOBS);

  let emailsSent = 0;

  if (action === "all" || action === "interview") {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingInterviews = await jobs
      .aggregate<JobWithUser>([
        {
          $match: {
            "interview.date": { $gte: now, $lte: tomorrow },
          },
        },
        {
          $lookup: {
            from: collections.USERS,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray();

    for (const job of upcomingInterviews) {
      if (job.user.emailPrefs?.interviewReminders !== false) {
        if (!job.interview?.date) continue;
        const email = buildInterviewReminderEmail({
          company: job.company,
          position: job.position,
          interviewDate: job.interview.date,
        });

        await sendEmail({
          to: job.user.email,
          subject: email.subject,
          html: email.html,
        });
        emailsSent++;
      }
    }
  }

  if (action === "all" || action === "followup") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleApplications = await jobs
      .aggregate<JobWithUser>([
        {
          $match: {
            status: "Applied",
            createdAt: { $lt: sevenDaysAgo },
          },
        },
        {
          $lookup: {
            from: collections.USERS,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray();

    for (const job of staleApplications) {
      if (job.user.emailPrefs?.followUpReminders !== false) {
        const email = buildFollowUpReminderEmail({
          company: job.company,
          position: job.position,
          appliedDate: job.createdAt,
        });

        await sendEmail({
          to: job.user.email,
          subject: email.subject,
          html: email.html,
        });
        emailsSent++;
      }
    }
  }

  if (action === "all" || action === "weekly") {
    const weeklyUsers = await users
      .find({ "emailPrefs.weeklySummary": true })
      .toArray();

    for (const user of weeklyUsers) {
      const stats = await jobs
        .aggregate<{ _id: string; count: number }>([
          {
            $match: {
              userId: user._id,
            },
          },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray();

      const data = {
        total: 0,
        applied: 0,
        interview: 0,
        rejected: 0,
        offer: 0,
      };

      stats.forEach((s) => {
        data.total += s.count;
        data[s._id.toLowerCase() as keyof typeof data] = s.count;
      });

      const email = buildWeeklySummaryEmail(data);
      await sendEmail({
        to: user.email,
        subject: email.subject,
        html: email.html,
      });
      emailsSent++;
    }
  }

  return NextResponse.json({ success: true, emailsSent });
}
