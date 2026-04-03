import { type ObjectId } from "mongodb";
import { collections, connectDB, dbConnect, toObjectId } from "@/lib/dbConnect";

export type EmailPrefs = {
  interviewReminders: boolean;
  followUpReminders: boolean;
  weeklySummary: boolean;
};

export type ProfileInput = {
  name: string;
  emailPrefs: EmailPrefs;
};

type UserProfileDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  emailPrefs?: Partial<EmailPrefs>;
};

function withDefaults(emailPrefs?: Partial<EmailPrefs>): EmailPrefs {
  return {
    interviewReminders: emailPrefs?.interviewReminders ?? true,
    followUpReminders: emailPrefs?.followUpReminders ?? true,
    weeklySummary: emailPrefs?.weeklySummary ?? true,
  };
}

export async function getUserProfileById(userId: string) {
  await connectDB();
  const users = dbConnect<UserProfileDoc>(collections.USERS);

  const user = await users.findOne({ _id: toObjectId(userId) });
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    emailPrefs: withDefaults(user.emailPrefs),
  };
}

export async function updateUserProfileById(
  userId: string,
  input: ProfileInput,
) {
  await connectDB();
  const users = dbConnect<UserProfileDoc>(collections.USERS);

  const result = await users.findOneAndUpdate(
    { _id: toObjectId(userId) },
    {
      $set: {
        name: input.name,
        emailPrefs: input.emailPrefs,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  const user = result;
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    emailPrefs: withDefaults(user.emailPrefs),
  };
}
