FROM node:20-alpine AS builder

# RUN apk add --no-cache bash

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
# for production ถ้าใช้จริงควรใช้บรรทัดล่างนี้ (ไม่มี shell)
# FROM gcr.io/distroless/nodejs20-debian12 AS production 

# for development and testing (มี shell)
FROM node:20-alpine AS production 

WORKDIR /app

# Copy only production node_modules and built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["dist/main.js"]
