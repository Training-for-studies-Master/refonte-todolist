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
 
# workspace monorepo
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
 
# copie du projet complet
COPY . .
 
# environnement production (IMPORTANT)
ENV NODE_ENV=production
 
# installation des dépendances
RUN pnpm install --frozen-lockfile
 
# build uniquement du gateway
RUN pnpm --filter gateway exec pnpm run build
 
# port exposé
EXPOSE 3000
 
# lancement du gateway uniquement
CMD ["pnpm", "--filter", "gateway", "start"]