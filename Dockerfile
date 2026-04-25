### Simple Dockerfile for Ghostodon ###
## Port expose : 50000 (Webhook server itself)
## Volume bind (recommended) : /app/config (config/cache/log files)

# Use Node.js v20 LTS, Alpine image
FROM node:20-alpine

# Set working directory to /app
WORKDIR /app

# Copy source files
COPY . .

# Use example configuration file as base config
RUN cp config/config.example.json config/config.json

# Install Node.js global dependencies
RUN npm install -f --location=global pnpm@latest

# Install project dependencies
RUN pnpm install --frozen-lockfile

# Entrypoint
ENTRYPOINT [ "pnpm", "start:prod" ]
EXPOSE 50000
