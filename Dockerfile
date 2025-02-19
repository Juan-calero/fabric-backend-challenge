FROM node:22.1-alpine AS base

FROM base AS dependencies
COPY ./package*.json ./
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM base AS final
ENV NODE_ENV=production

RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

COPY --from=dependencies /node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/documents ./documents

RUN chown -R nodeuser:nodegroup /dist /node_modules /documents
USER nodeuser

ENTRYPOINT ["node", "dist/main.js"]
EXPOSE 3000
