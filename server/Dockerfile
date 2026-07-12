FROM node:24-alpine AS base
WORKDIR /app

COPY --chown=node:node package*.json ./

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
COPY --chown=node:node . .

RUN npm run build

USER node

# =============================================================================
# Migration stage - includes devDependencies for typeorm CLI
# =============================================================================
FROM node:24-alpine AS migration
WORKDIR /app

# Copy node_modules from base (has all dependencies including devDependencies)
COPY --chown=node:node --from=base /app/node_modules/ ./node_modules/
COPY --chown=node:node --from=base /app/dist/ ./dist
COPY --chown=node:node --from=base /app/package*.json ./
COPY --chown=node:node --from=base /app/src/ ./src/
COPY --chown=node:node --from=base /app/domain/ ./domain/
COPY --chown=node:node --from=base /app/scripts/ ./scripts/
COPY --chown=node:node --from=base /app/tsconfig.json ./
COPY --chown=node:node --from=base /app/tsconfig.build.json ./

RUN mkdir -p tmp && chown -R node:node tmp && \
  chown -R node:node /app

ENV NODE_ENV=production

USER node

# Run migrations by default
CMD ["npm", "run", "migration:run"]

# =============================================================================
# Production stage - minimal image with only production dependencies
# =============================================================================
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
