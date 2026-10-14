# ==========================================
# Stage 1: Build the React + Vite Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies deterministically
COPY package*.json ./
RUN npm ci

# Copy project source and configuration files
COPY . .

# Build the production distribution
RUN npm run build

# ==========================================
# Stage 2: Production Server for Cloud Run
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Google Cloud Run injects PORT (default 8080)
ENV PORT=8080

# Copy built production assets from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Copy production static server and package metadata
COPY --chown=node:node server.js ./package.json ./

# Switch to unprivileged user for container security
USER node

# Document the exposed port for documentation/local testing
EXPOSE 8080

# Start production server listening on 0.0.0.0:${PORT}
CMD ["node", "server.js"]
