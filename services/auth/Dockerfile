FROM node:20-alpine

WORKDIR /app

# Active pnpm via corepack
RUN corepack enable

# on copie tout le repo AVANT install
COPY . .

ENV NODE_ENV=development

# Installation des dépendances du workspace
RUN pnpm install --frozen-lockfile

# Build uniquement du service auth
RUN pnpm --filter auth run build

EXPOSE 3001

CMD ["pnpm", "--filter", "auth", "start"]