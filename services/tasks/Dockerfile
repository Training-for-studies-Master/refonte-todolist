FROM node:20-alpine

WORKDIR /app

# Optionnel mais recommandé (modules natifs + pnpm)
RUN apk add --no-cache python3 make g++ \
 && corepack enable

# Copier manifests (cache Docker)
COPY package.json pnpm-lock.yaml ./

# Install reproductible (équivalent npm ci)
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build
RUN pnpm build

# Exposer le port
EXPOSE 3002

# Start
CMD ["pnpm", "start"]