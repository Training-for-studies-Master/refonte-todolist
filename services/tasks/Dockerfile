FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
 && corepack enable

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm --filter tasks build

EXPOSE 3003

CMD ["pnpm", "--filter", "tasks", "start"]