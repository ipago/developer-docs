# syntax=docker/dockerfile:1
#
# Build context MUST be the repo root, e.g.:
#   docker build -f apps/docs/Dockerfile -t ipago-docs:$TAG .
#
# pnpm-workspace monorepo, so `next build` with output: "standalone" emits a NESTED layout:
# the server entry lands at apps/docs/.next/standalone/apps/docs/server.js alongside a top-level
# node_modules. Modeled on apps/app/Dockerfile. Fumadocs generates its .source during
# `pnpm install` (the @ipago/docs postinstall runs `fumadocs-mdx`), and the /md raw-markdown
# routes + /llms.txt are statically generated at build time, so no content/ is needed at runtime.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# 1. Install workspace dependencies (runs the fumadocs-mdx postinstall that emits .source).
FROM base AS deps
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 2. Build only the docs package.
FROM base AS builder
COPY --from=deps /repo /repo
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @ipago/docs build

# 3. Production image: copy only the standalone output.
FROM base AS runner
WORKDIR /repo
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/docs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/docs/.next/static ./apps/docs/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "apps/docs/server.js"]
