# Planner

This is a home assignment: an extensible task-management platform. Tasks move through
per-type workflows (e.g. procurement, development), each with its own statuses, required
data, and next-assignee rules, without hardcoding per-type logic throughout the app.

- `apps/api` — NestJS + TypeORM REST API (Postgres)
- `apps/web` — React (Vite) client
- `packages` — shared types used by both apps

## Prerequisites

- Node.js and pnpm (`packageManager` pinned in `package.json`)
- Docker + Docker Compose, used to run the Postgres database (`docker-compose.yml`)

On Ubuntu/WSL, if Docker isn't installed:

```
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
sudo service docker start
```

After running `usermod`, start a new shell session (or run `newgrp docker`) for the group change to take effect.

## First-time setup

```
pnpm install                          # install dependencies for all workspaces
docker compose up -d                  # start Postgres in the background
cp apps/api/.env.example apps/api/.env  # local API env (defaults already work with the above compose config)
pnpm --filter @planner/api migration:run  # create the schema
pnpm --filter @planner/api seed       # seed demo users and tasks (there's no way to create a user from the UI, so this is required)
pnpm dev                              # start both the API and web dev servers
```

Once running:

- Web app: http://localhost:5173
- API: http://localhost:3000/api (the web dev server proxies `/api` requests to it)

There's no authentication — the UI lets you pick which user you're acting as from the
seeded users list.

## Running tests

```
pnpm test
```

This runs the API's e2e test suite (`apps/api/test/*.e2e-spec.ts`) against the database
started above.
