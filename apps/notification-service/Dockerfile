# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm with specific version
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Remove dev dependencies
RUN pnpm prune --prod

# Production stage - using distroless for security (0 vulnerabilities)
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

# Copy only production files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV PORT=3004
ENV HOST=0.0.0.0
EXPOSE 3004

# Start the application
CMD ["dist/main.js"]