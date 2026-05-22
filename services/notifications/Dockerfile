FROM node:20

WORKDIR /app

# Activer pnpm via Corepack (pas d'installation globale)
RUN corepack enable

# Copier manifests (optimisation cache Docker)
COPY package.json pnpm-lock.yaml ./

# Installation reproductible (équivalent npm install propre)
RUN pnpm install --frozen-lockfile

# Copier le reste du code
COPY . .

# Build de l'application
RUN pnpm build

# Démarrage
CMD ["pnpm", "start"]