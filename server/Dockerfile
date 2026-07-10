FROM node:24-alpine AS base
WORKDIR /app

COPY --chown=node:node package*.json ./

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
COPY --chown=node:node . .

RUN npm run build

USER node

FROM node:24-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node --from=base /app/dist/ ./dist
COPY --chown=node:node --from=base /app/package*.json ./

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci --omit=dev
RUN mkdir -p tmp && chown -R node:node tmp && \
  chown -R node:node /app

USER node

CMD ["node", "./dist/src/main"]
