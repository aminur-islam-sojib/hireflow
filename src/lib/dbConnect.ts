import {
  MongoClient,
  ObjectId,
  ServerApiVersion,
  type Collection,
  type Document,
} from "mongodb";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

export const collections = {
  USERS: "users",
  JOBS: "jobs",
} as const;

type MongoStateName = "idle" | "connecting" | "connected" | "error";

type MongoState = {
  state: MongoStateName;
  readyState: number;
  uriConfigured: boolean;
  connectedAt: string | null;
  lastError: string | null;
};

const uri = process.env.MONGO_URI;
const dname = process.env.DB_NAME;

const currentServers = dns.getServers();
const localhostResolvers = ["127.0.0.1", "::1"];
const looksLikeLocalStubOnly =
  currentServers.length > 0 &&
  currentServers.every((server) => localhostResolvers.includes(server));

const dnsServers = process.env.MONGO_DNS_SERVERS?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (looksLikeLocalStubOnly && (!dnsServers || dnsServers.length === 0)) {
  console.warn(
    "Node DNS is using localhost resolver only. If MongoDB SRV lookup fails with ECONNREFUSED, set MONGO_DNS_SERVERS in .env (example: MONGO_DNS_SERVERS=192.168.0.1).",
  );
}

// Apply explicit DNS override whenever configured.
if (dnsServers && dnsServers.length > 0) {
  try {
    dns.setServers(dnsServers);
    dnsPromises.setServers(dnsServers);
  } catch (error) {
    console.warn("Failed to set custom DNS servers for MongoDB:", error);
  }
}

// here code changes
if (!uri) {
  throw new Error("❌ Please add MONGO_URI to .env.local");
}

// here code changes
if (!dname) {
  throw new Error("❌ Please add DB_NAME to .env.local");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let connectPromise: Promise<MongoClient> | null = null;
let mongoState: MongoState = {
  state: "idle",
  readyState: 0,
  uriConfigured: true,
  connectedAt: null,
  lastError: null,
};

function mapReadyState(state: MongoStateName): number {
  if (state === "connected") return 1;
  if (state === "connecting") return 2;
  if (state === "error") return 3;
  return 0;
}

function setMongoState(next: Partial<MongoState>) {
  mongoState = {
    ...mongoState,
    ...next,
  };
  mongoState.readyState = mapReadyState(mongoState.state);
}

export async function connectDB() {
  if (mongoState.state === "connected") {
    return client;
  }

  if (!connectPromise) {
    setMongoState({ state: "connecting", lastError: null });
    connectPromise = client
      .connect()
      .then((connectedClient) => {
        setMongoState({
          state: "connected",
          connectedAt: new Date().toISOString(),
          lastError: null,
        });
        return connectedClient;
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        setMongoState({ state: "error", lastError: message });
        connectPromise = null;
        throw error;
      });
  }

  return connectPromise;
}

export async function checkMongoConnection() {
  try {
    await connectDB();
    await client.db(dname).command({ ping: 1 });
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return false;
  }
}

export function dbConnect<TSchema extends Document = Document>(
  cname: string,
): Collection<TSchema> {
  return client.db(dname).collection(cname);
}

export function toObjectId(value: string) {
  return new ObjectId(value);
}

export function getMongoConnectionState() {
  return { ...mongoState };
}

export function getMongoRecoveryHint(error: string | null) {
  if (!error) return null;
  const normalized = error.toLowerCase();

  if (normalized.includes("querysrv") || normalized.includes("econnrefused")) {
    return "DNS SRV lookup failed. Set MONGO_DNS_SERVERS in .env and verify your network DNS allows SRV queries.";
  }
  if (normalized.includes("authentication failed")) {
    return "Mongo authentication failed. Verify username/password in MONGO_URI.";
  }
  if (normalized.includes("timed out") || normalized.includes("timeout")) {
    return "Mongo connection timed out. Check internet access, firewall rules, and Atlas network allowlist.";
  }

  return "Check MONGO_URI, DB_NAME, and cluster availability, then retry.";
}

export async function getMongoSrvPreflight() {
  const safeUri = uri || "";

  if (!safeUri.startsWith("mongodb+srv://")) {
    return {
      ok: true,
      skipped: true,
      reason: "Not using mongodb+srv URI",
    };
  }

  try {
    const hostPortion =
      safeUri.replace("mongodb+srv://", "").split("/")[0] || "";
    const host = hostPortion.includes("@")
      ? hostPortion.split("@")[1]
      : hostPortion;
    if (!host) {
      return {
        ok: false,
        skipped: false,
        error: "Could not parse SRV host from MONGO_URI",
      };
    }

    const srvRecord = `_mongodb._tcp.${host}`;
    const hosts = await dnsPromises.resolveSrv(srvRecord);

    return {
      ok: hosts.length > 0,
      skipped: false,
      srvRecord,
      hosts,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
