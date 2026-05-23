FROM node:20-alpine

WORKDIR /app

RUN corepack enable

# Copier workspace root 
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copier tout le monorepo
COPY . .

ENV NODE_ENV=development
# Installer dependances
RUN pnpm install --frozen-lockfile

#  Build uniquement gateway
RUN pnpm --filter gateway exec pnpm run build

EXPOSE 3000

# 5. Run uniquement gateway
CMD ["pnpm", "--filter", "gateway", "start"]