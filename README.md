# Job Tracker

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Health Endpoint

This app includes a protected status endpoint at `/api/health`.

- Auth: send `x-health-secret` header, or `?secret=...` query value.
- Secret source: `HEALTHCHECK_SECRET` (preferred), falls back to `CRON_SECRET`.
- Response includes:
  - database connectivity and latency
  - environment readiness flags
  - auth readiness flags
  - email readiness flags

Example:

```bash
curl -H "x-health-secret: YOUR_SECRET" http://localhost:3000/api/health
```

Status codes:

- `200`: all checks are healthy
- `503`: one or more checks are degraded
- `401`: missing or invalid health secret

## MongoDB SRV Troubleshooting

If you see errors like `querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net`, check:

1. DNS resolution from your machine:

```powershell
nslookup cluster0.dq2s2sy.mongodb.net
nslookup -type=SRV _mongodb._tcp.cluster0.dq2s2sy.mongodb.net
node -e "require('dns').resolveSrv('_mongodb._tcp.cluster0.dq2s2sy.mongodb.net', (err, records) => console.log(err || records))"
```

1. Atlas cluster is running (not paused/deleted).
1. Atlas database user/password are valid.
1. Atlas network access allowlist includes your current public IP.
1. Local firewall, VPN, proxy, or antivirus is not blocking DNS/SRV lookups.
1. `MONGO_URI` has no extra whitespace or accidental quotes.
1. If `nslookup` works but Node still shows `querySrv ECONNREFUSED`, use a non-SRV `MONGO_URI` connection string so the app can bypass SRV DNS.

Use the diagnostics endpoints to confirm root cause quickly:

1. In development, call `/api/dev/db` and review:
1. `lastError.kind`
1. `recoveryHint`
1. `srvPreflight` (`ok`, `srvRecord`, `hosts`, `error`)
1. For production-safe checks, call `/api/health` with `x-health-secret` and review `database.recoveryHint` and `database.srvPreflight`.

Expected healthy database state:

- `connected: true` (dev endpoint)
- `state: connected`
- `latencyMs` is non-null
- `error: null`
- `srvPreflight.ok: true` (when using `mongodb+srv://` URI)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
