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

# Prune dev dependencies
RUN pnpm prune --prod

# Production stage - use distroless for minimal attack surface
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

# Copy only production node_modules and built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV PORT=3001
ENV HOST=0.0.0.0
EXPOSE 3001

CMD ["dist/main.js"]
