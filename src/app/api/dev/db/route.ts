import { NextResponse } from "next/server";
import {
  collections,
  connectDB,
  dbConnect,
  getMongoConnectionState,
  getMongoRecoveryHint,
  getMongoSrvPreflight,
} from "@/lib/dbConnect";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let pingOk = false;
  let pingError: string | null = null;
  let latencyMs: number | null = null;

  try {
    const start = Date.now();
    await connectDB();

    await dbConnect(collections.JOBS).db.command({ ping: 1 });
    pingOk = true;

    latencyMs = Date.now() - start;
  } catch (error) {
    pingError = error instanceof Error ? error.message : String(error);
  }

  const mongoState = getMongoConnectionState();
  const connected = mongoState.state === "connected" && pingOk;
  const srvPreflight = await getMongoSrvPreflight();
  const recoveryHint = getMongoRecoveryHint(mongoState.lastError);

  return NextResponse.json(
    {
      connected,
      state: mongoState.state,
      readyState: mongoState.readyState,
      uriConfigured: mongoState.uriConfigured,
      latencyMs,
      error: pingError,
      lastError: mongoState.lastError,
      recoveryHint,
      srvPreflight,
      timestamp: new Date().toISOString(),
    },
    { status: connected ? 200 : 503 },
  );
}
