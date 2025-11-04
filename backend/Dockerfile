# ─── Stage 1: dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install build tools needed by some native addons (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev

# ─── Stage 2: production image ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 postcraft

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure the app is owned by the non-root user
RUN chown -R postcraft:nodejs /app && chmod +x start.sh

USER postcraft

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Runs migrations then starts the server
CMD ["sh", "start.sh"]
