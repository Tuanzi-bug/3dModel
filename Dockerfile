# ---- Base: 所有阶段共享 ----
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ---- Dependencies: 依赖安装层（缓存优化） ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile

# ---- Dev: 开发目标 ----
FROM base AS dev
# dev 阶段不 COPY 源码，通过 bind mount 挂载
# node_modules 通过 named volume 从 deps 阶段同步
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]

# ---- E2E: Playwright 测试环境 ----
# 基于官方 Playwright 镜像，内置 Chromium 及所有系统依赖
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS e2e
# 接收构建时代理参数（用于 apt-get 等网络操作）
ARG http_proxy
ARG https_proxy
ARG HTTP_PROXY
ARG HTTPS_PROXY
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
# node_modules 通过 bind mount 从宿主卷挂载，不在此安装
# 工作目录、源码、node_modules 均由 docker-compose 挂载
CMD ["pnpm", "--filter", "web", "test:e2e"]

# ---- Build: 生产构建 ----
FROM deps AS build
COPY . .
RUN pnpm --filter web exec prisma generate
RUN pnpm --filter web build

# ---- Production: 最小化生产镜像 ----
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/packages/web/.next/standalone ./
COPY --from=build /app/packages/web/.next/static ./.next/static
COPY --from=build /app/packages/web/public ./public
COPY --from=build /app/packages/web/prisma ./prisma
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]

