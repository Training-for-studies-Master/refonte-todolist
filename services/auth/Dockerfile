FROM node:20-alpine

WORKDIR /app

# Activer pnpm via Corepack
RUN corepack enable

# Copier manifests (cache Docker)
COPY package.json pnpm-lock.yaml ./

# Installation reproductible (équivalent npm ci)
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build de l’application
RUN pnpm build

# Exposer le port
EXPOSE 3001

# Démarrage
CMD ["pnpm", "start"]