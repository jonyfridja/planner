FROM node:22-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@planner/api...

FROM node:22-alpine AS runner
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

COPY --from=builder /repo/package.json /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml /repo/tsconfig.base.json ./
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/packages/shared ./packages/shared
COPY --from=builder /repo/apps/api ./apps/api

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "pnpm migration:run && node dist/main.js"]
