# ---- Stage 1: build the TypeScript ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: small runtime image ----
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# compiled code
COPY --from=builder /app/dist ./dist
# tsc does not copy .ejs files, so ship the views next to the code
# (both locations are copied so it works however app.ts resolves the views path)
COPY --from=builder /app/src/views ./src/views
COPY --from=builder /app/src/views ./dist/views
# static files
COPY --from=builder /app/public ./public

RUN mkdir -p uploads logs

EXPOSE 3000
CMD ["node", "dist/server.js"]