FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm --filter notifications build

EXPOSE 3002

CMD ["pnpm", "--filter", "notifications", "start"]