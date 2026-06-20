FROM node:20-alpine

LABEL provides.api-version="v1"
LABEL service.name="gateway"
LABEL requires.auth=">=1.0.0 <=2.0.0"
LABEL requires.projects=">=1.0.0 <=2.0.0"
LABEL requires.notifications=">=1.0.0 <=2.0.0"
LABEL requires.frontend=">=1.0.0 <=2.0.0"
LABEL requires.tasks=">=1.0.0 <=2.0.0"

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