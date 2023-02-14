# Use Node.js v18 LTS, Alpine image
FROM node:18-alpine

# Set working directory to /app
WORKDIR /app

# Copy source files
COPY . .

# Install Node.js global dependencies
RUN npm install -f --location=global yarn@latest

# Install project dependencies
RUN yarn install --immutable

# Entrypoint
RUN yarn start
EXPOSE 50000
