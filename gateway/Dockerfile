# --- ÉTAPE 1 : Le Build ---
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

# Fichiers du workspace monorepo
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copie de tout le code pour le build
COPY . .

# On installe TOUTES les dépendances (y compris tsc dans devDependencies)
RUN pnpm install --frozen-lockfile

# Build de la gateway (syntaxe simplifiée sans le 'exec pnpm')
RUN pnpm --filter gateway run build

# --- ÉTAPE 2 : L'image finale de Production ---
FROM node:20-alpine

LABEL provides.api-version="v1"
LABEL service.name="gateway"
LABEL requires.auth=">=1.0.0 <=2.0.0"
LABEL requires.projects=">=1.0.0 <=2.0.0"
LABEL requires.notifications=">=1.0.0 <=2.0.0"
LABEL requires.frontend=">=1.0.0 <=2.0.0"
LABEL requires.tasks=">=1.0.0 <=2.0.0"
LABEL service.version="2.0.0"

WORKDIR /app
RUN corepack enable

# On ne passe en production qu'ici
ENV NODE_ENV=production

# On récupère les fichiers du workspace et le build généré à l'étape 1
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY --from=builder /app/gateway/dist ./gateway/dist
COPY --from=builder /app/gateway/package.json ./gateway/package.json

# On réinstalle UNIQUEMENT les dépendances de production (légères, sans tsc)
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000

CMD ["pnpm", "--filter", "gateway", "start"]