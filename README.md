# Family Portal

Monorepo for the private family platform:

- `apps/portal`: portal and Better Auth entry point;
- `apps/calendar`: shared family calendar;
- `packages/auth`: shared server and browser auth clients;
- `packages/db`: portal Prisma client and schema.

The calendar has no local authentication or user seed. Accounts are managed by the portal.

## Local Development

Prerequisites: Node.js 22, npm, PowerShell, and Podman with `podman-compose`.

Install dependencies:

```powershell
npm install
```

Create the root environment file:

```powershell
Copy-Item .env.example .env
```

The local Podman Compose stack creates both PostgreSQL databases, applies migrations, and creates these initial Portal admins automatically:

```text
terry.pasquet@proton.me
aurelie.manier@gmail.com
```

Their passwords are read from the ignored root `.env` through `PORTAL_SEED_TERRY_PASSWORD` and `PORTAL_SEED_AURELIE_PASSWORD`.

Start Podman:

```powershell
podman machine start
```

Build and start the complete platform:

```powershell
npm run podman:local:up
```

Open:

- Portal: http://localhost:3100
- Calendar: http://localhost:3101/calendar

Stop the platform:

```powershell
npm run podman:local:down
```

View logs:

```powershell
npm run podman:local:logs
```

Reset local databases:

```powershell
podman-compose -f docker-compose.local.yml down -v
```

The Podman script builds the four images explicitly because `podman-compose 1.6.0` does not reliably forward monorepo Dockerfile paths. To build without starting:

```powershell
npm run podman:local:build
```

## Node Development Without Containers

Use two PostgreSQL databases and configure:

```env
PORTAL_DATABASE_URL=postgresql://portal:portal@localhost:5432/portal?schema=public
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3100
CALENDAR_URL=http://localhost:3101/calendar
```

In `apps/calendar/.env`:

```env
DATABASE_URL=postgresql://calendar:calendar@localhost:5432/calendar?schema=public
NEXT_PUBLIC_PORTAL_AUTH_URL=http://localhost:3100
CALENDAR_URL=http://localhost:3101/calendar
```

Apply migrations, then start the apps in separate terminals:

```powershell
npx prisma migrate deploy --schema packages/db/prisma/schema.prisma
npx prisma generate --schema apps/calendar/prisma/schema.prisma
npx prisma migrate deploy --schema apps/calendar/prisma/schema.prisma
npm run dev
npm run dev -w @family/calendar
```

## Validation

```powershell
npm run typecheck
npm run lint
npm run build
npm run calendar:typecheck
npm run calendar:lint
npm run calendar:test
npm run calendar:build
```

Integration tests require explicit compatible calendar fixtures. The calendar no longer creates authentication users, passwords, or sessions.

## VPS Deployment

Deployment manifests live under `deploy/`:

- `deploy/portal`: portal, PostgreSQL, migrations, backups;
- `deploy/calendar`: calendar, PostgreSQL, migrations, backups;
- `deploy/edge`: shared Caddy and Watchtower.

Both app containers listen internally on `3100`. Only Caddy publishes `80` and `443`. Create the shared network once:

```bash
docker network create family-edge
docker network create family-auth
```

Production URLs are path-based:

- Portal: `https://minminmin.fr/`
- Calendar: `https://minminmin.fr/calendar`

Configure the edge stack with:

```env
DOMAIN=minminmin.fr
```

The application stacks should use:

```env
BETTER_AUTH_URL=https://minminmin.fr
CALENDAR_URL=https://minminmin.fr/calendar
NEXT_PUBLIC_PORTAL_AUTH_URL=https://minminmin.fr
PORTAL_DATABASE_URL=postgresql://portal:<password>@db:5432/portal?schema=public
PORTAL_AUTH_DATABASE_URL=postgresql://portal:<same-password>@portal-db:5432/portal?schema=public
```

`PORTAL_DATABASE_URL` is used inside the Portal stack, where the database service is named `db`. `PORTAL_AUTH_DATABASE_URL` is injected into Calendar and reaches the same database through the private `family-auth` network alias `portal-db`.

The edge Caddy is the only public HTTP entry point. It forwards `/calendar/*` to the calendar container and every other path to the portal container.

`family-auth` is a private shared Docker network: `portal-db` joins it with the alias `portal-db`, and the Calendar app joins it to validate Portal sessions. PostgreSQL is not published on a host port.

The Calendar workflow expects the GitHub repository variable `PUBLIC_PORTAL_AUTH_URL` to contain `https://minminmin.fr`. Without it, the browser client falls back to the current origin, which is correct for the path-based production layout but not for a separate local port.

Each GitHub Actions workflow publishes a separate GHCR image, so calendar updates remain independent from portal updates. Changes to shared packages intentionally trigger the apps that consume them.

## Troubleshooting

Check local ports:

```powershell
Get-NetTCPConnection -LocalPort 3100,3101 -ErrorAction SilentlyContinue
```

For `Failed to fetch` during local calendar access, verify that the portal is running, `NEXT_PUBLIC_PORTAL_AUTH_URL` points to `http://localhost:3100`, and the account exists in `portal-db`. In production it must point to `https://minminmin.fr`.

## Current Limitations

- The new databases are initialized from scratch; the old `tpasquet/calendar` deployment is out of scope.
- Portal invitations and password reset emails are not implemented.
- VAPID keys are required for Web Push.
- The calendar owns no authentication users or passwords; identities are managed by Portal.
