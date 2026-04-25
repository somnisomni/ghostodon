### Dockerfile for Ghostodon ###

# --- Build Stage ---
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source and config
COPY . .

# Build TypeScript
RUN pnpm build

# --- Production Stage ---
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install pnpm (needed for runtime start script or prod install if preferred)
RUN npm install -g pnpm@latest

# Copy built files and runtime necessities
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/config/config.example.json ./config/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Ghostodon default port
EXPOSE 50000

# Start application
ENTRYPOINT [ "pnpm", "start:prod" ]
