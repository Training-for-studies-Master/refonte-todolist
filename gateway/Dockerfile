FROM node:20-alpine

WORKDIR /app

# Activer corepack (pnpm sans installation globale)
RUN corepack enable

# Copier uniquement les manifests (cache Docker optimisé)
COPY package.json pnpm-lock.yaml ./

# Installation reproductible (équivalent npm ci)
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build TypeScript / app
RUN pnpm build

# Exposer le port
EXPOSE 3000

# Démarrage
CMD ["pnpm", "start"]