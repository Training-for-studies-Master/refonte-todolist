FROM node:20-alpine

LABEL provides.api-version="v1"
LABEL service.name="auth"
LABEL requires.tasks=">=1.2.0 <=2.0.0"
LABEL requires.projects=">=1.2.0 <=2.0.0"
LABEL requires.notifications=">=1.2.0 <=2.0.0"
LABEL requires.frontend=">=1.2.0 <=2.0.0"
LABEL requires.gateway=">=1.2.0 <=2.0.0"

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