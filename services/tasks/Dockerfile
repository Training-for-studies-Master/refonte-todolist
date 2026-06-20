FROM node:20-alpine

LABEL provides.api-version="v1"
LABEL service.name="tasks"
LABEL requires.auth=">=1.0.0 <=2.0.0"
LABEL requires.projects=">=1.0.0 <=2.0.0"
LABEL requires.notifications=">=1.0.0 <=2.0.0"
LABEL requires.frontend=">=1.0.0 <=2.0.0"
LABEL requires.gateway=">=1.0.0 <=2.0.0"

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
 && corepack enable

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

COPY . .

ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile

RUN pnpm --filter tasks exec pnpm run build
# RUN pnpm run build

EXPOSE 3003

CMD ["pnpm", "--filter", "tasks", "start"]