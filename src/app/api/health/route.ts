import { NextRequest, NextResponse } from "next/server";
import {
  collections,
  connectDB,
  dbConnect,
  getMongoConnectionState,
  getMongoRecoveryHint,
  getMongoSrvPreflight,
} from "@/lib/dbConnect";

type HealthStatus = "ok" | "degraded";

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function boolFlags(flags: Record<string, boolean>) {
  const missing = Object.entries(flags)
    .filter(([, present]) => !present)
    .map(([name]) => name);

  return {
    ok: missing.length === 0,
    checks: flags,
    missing,
  };
}

export async function GET(req: NextRequest) {
  const providedSecret =
    req.headers.get("x-health-secret") ||
    req.nextUrl.searchParams.get("secret");
  const expectedSecret =
    process.env.HEALTHCHECK_SECRET || process.env.CRON_SECRET || "";

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envReadiness = boolFlags({
    MONGO_URI: hasValue(process.env.MONGO_URI),
    NEXTAUTH_SECRET: hasValue(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: hasValue(process.env.NEXTAUTH_URL),
    CRON_SECRET: hasValue(process.env.CRON_SECRET),
  });

  const authReadiness = boolFlags({
    NEXTAUTH_SECRET: hasValue(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: hasValue(process.env.NEXTAUTH_URL),
    GOOGLE_CLIENT_ID: hasValue(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: hasValue(process.env.GOOGLE_CLIENT_SECRET),
  });

  const emailReadiness = boolFlags({
    SMTP_HOST: hasValue(process.env.SMTP_HOST),
    SMTP_PORT: hasValue(process.env.SMTP_PORT),
    SMTP_USER: hasValue(process.env.SMTP_USER),
    SMTP_PASS: hasValue(process.env.SMTP_PASS),
    EMAIL_FROM: hasValue(process.env.EMAIL_FROM),
    CRON_SECRET: hasValue(process.env.CRON_SECRET),
  });

  let mongoLatencyMs: number | null = null;
  let mongoError: string | null = null;

  try {
    const start = Date.now();
    await connectDB();
    await dbConnect(collections.JOBS).db.command({ ping: 1 });

    mongoLatencyMs = Date.now() - start;
  } catch (error) {
    mongoError = error instanceof Error ? error.message : String(error);
  }

  const mongoState = getMongoConnectionState();
  const srvPreflight = await getMongoSrvPreflight();
  const recoveryHint = getMongoRecoveryHint(mongoState.lastError);
  const mongoReadiness = {
    ok: mongoState.state === "connected" && !mongoError,
    latencyMs: mongoLatencyMs,
    error: mongoError,
    recoveryHint,
    srvPreflight,
    ...mongoState,
  };

  const overall: HealthStatus =
    mongoReadiness.ok &&
    envReadiness.ok &&
    authReadiness.ok &&
    emailReadiness.ok
      ? "ok"
      : "degraded";

  return NextResponse.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database: mongoReadiness,
      environment: envReadiness,
      auth: authReadiness,
      email: emailReadiness,
    },
    { status: overall === "ok" ? 200 : 503 },
  );
}
