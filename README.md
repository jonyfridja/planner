# Planner

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

## Setup

```
pnpm install
docker compose up -d
cp apps/api/.env.example apps/api/.env
pnpm dev
```
