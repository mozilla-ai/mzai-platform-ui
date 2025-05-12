# Stage 0: Base image with dependencies
FROM node:lts-alpine AS deps

RUN corepack enable

WORKDIR /mzai-platform-ui

COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch

# Stage 1: Build the app
FROM node:lts-alpine AS builder

RUN corepack enable

WORKDIR /mzai-platform-ui

COPY package.json pnpm-lock.yaml ./
COPY --from=deps /root/.local/share/pnpm/store /root/.local/share/pnpm/store

RUN pnpm install --offline

COPY . .
RUN pnpm build

# Stage 2: Production image
FROM nginx:1.25-alpine AS runner

# Remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /mzai-platform-ui/dist/ /usr/share/nginx/html/

# Optional: custom nginx config
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
