FROM node:20-alpine

LABEL provides.api-version="v1"
LABEL service.name="notifications"
LABEL requires.auth=">=1.0.0 <=2.0.0"
LABEL requires.projects=">=1.0.0 <=2.0.0"
LABEL requires.tasks=">=1.0.0 <=2.0.0"
LABEL requires.frontend=">=1.0.0 <=2.0.0"
LABEL requires.gateway=">=1.0.0 <=2.0.0"
LABEL service.version="2.0.0"

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

COPY . .

ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile

RUN pnpm --filter notifications exec pnpm run build

EXPOSE 3002

CMD ["pnpm", "--filter", "notifications", "start"]