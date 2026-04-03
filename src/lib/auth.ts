import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import { collections, connectDB, dbConnect } from "@/lib/dbConnect";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const users = dbConnect<{
          _id?: { toString(): string };
          name: string;
          email: string;
          image?: string;
          password?: string;
        }>(collections.USERS);

        const email = parsed.data.email.toLowerCase();
        const user = await users.findOne({ email });

        if (!user || !user.password) return null;

        const isValid = await compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return {
          id: (user._id as object).toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();
        const users = dbConnect<{
          _id?: { toString(): string };
          name: string;
          email: string;
          image?: string;
        }>(collections.USERS);

        const normalizedEmail = user.email?.toLowerCase();
        if (!normalizedEmail) {
          return false;
        }

        let existingUser = await users.findOne({ email: normalizedEmail });

        if (!existingUser) {
          const oauthProfile = profile as
            | { picture?: string; image?: string; name?: string }
            | undefined;
          const doc = {
            name: user.name || oauthProfile?.name || "User",
            email: normalizedEmail,
            image: user.image || oauthProfile?.picture || oauthProfile?.image,
          };
          const result = await users.insertOne(doc);
          existingUser = {
            _id: result.insertedId,
            ...doc,
          };
        }

        if (existingUser._id) {
          user.id = (existingUser._id as object).toString();
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image as string;
      }

      if (trigger === "update") {
        const incomingName =
          typeof (session as { name?: unknown } | undefined)?.name === "string"
            ? (session as { name: string }).name
            : undefined;

        if (incomingName) {
          token.name = incomingName;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
