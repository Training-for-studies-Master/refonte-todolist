FROM node:20-alpine

WORKDIR /app

RUN corepack enable

# Copier workspace root 
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copier tout le monorepo
COPY . .

# Installer deps 
RUN pnpm install --frozen-lockfile

# Build uniquement auth
RUN pnpm --filter auth build

EXPOSE 3001

# Run uniquement auth
CMD ["pnpm", "--filter", "auth", "start"]