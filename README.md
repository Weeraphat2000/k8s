# NestJS Microservices Project

A NestJS microservices architecture with API Gateway, User Service, Product Service, Order Service, and Notification Service.

## Architecture

```
┌─────────────────┐
│   API Gateway   │ ← HTTP (Port 3000)
│   (Port 3000)   │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────────┐
    │         │            │              │
    ▼         ▼            ▼              ▼
┌───────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐
│ User  │ │ Product │ │  Order  │ │ Notification │
│Service│ │ Service │ │ Service │ │   Service    │
│ :3001 │ │  :3002  │ │  :3003  │ │    :3004     │
└───────┘ └─────────┘ └─────────┘ └──────────────┘
    ▲         ▲            ▲              ▲
    └─────────┴────────────┴──────────────┘
                  TCP Transport
```

## Project Structure

```
├── apps/
│   ├── api-gateway/          # API Gateway (HTTP entry point)
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── Dockerfile
│   ├── user-service/         # User microservice (TCP :3001)
│   ├── product-service/      # Product microservice (TCP :3002)
│   ├── order-service/        # Order microservice (TCP :3003)
│   └── notification-service/ # Notification microservice (TCP :3004)
├── libs/
│   └── shared/               # Shared DTOs and interfaces
└── docker-compose.yml        # Docker Compose for local development
```

## Prerequisites

- Node.js 20+
- pnpm
- Docker (optional, for containerized deployment)

---

## Installation

### Install dependencies for all apps

```bash
for app in api-gateway user-service product-service order-service notification-service; do
  (cd apps/$app && pnpm install)
done
```

### Install dependencies for a specific app

```bash
cd apps/api-gateway && pnpm install
```

### Add a new dependency to an app

```bash
cd apps/api-gateway
pnpm add <package-name>        # Production dependency
pnpm add -D <package-name>     # Dev dependency
```

---

## Running Locally (Without Docker)

### Option 1: Run each service in separate terminals

```bash
# Terminal 1 - User Service
cd apps/user-service && pnpm start:dev

# Terminal 2 - Product Service
cd apps/product-service && pnpm start:dev

# Terminal 3 - Order Service
cd apps/order-service && pnpm start:dev

# Terminal 4 - Notification Service
cd apps/notification-service && pnpm start:dev

# Terminal 5 - API Gateway (start last)
cd apps/api-gateway && pnpm start:dev
```

### Option 2: Run all in background

```bash
(cd apps/user-service && pnpm start:dev &)
(cd apps/product-service && pnpm start:dev &)
(cd apps/order-service && pnpm start:dev &)
(cd apps/notification-service && pnpm start:dev &)
sleep 3
cd apps/api-gateway && pnpm start:dev
```

### Option 3: Using concurrently

```bash
pnpm add -g concurrently

concurrently \
  "cd apps/user-service && pnpm start:dev" \
  "cd apps/product-service && pnpm start:dev" \
  "cd apps/order-service && pnpm start:dev" \
  "cd apps/notification-service && pnpm start:dev" \
  "cd apps/api-gateway && pnpm start:dev"
```

---

## Running with Docker Compose

### Build and start all services

```bash
docker compose up --build
```

### Start in detached mode

```bash
docker compose up -d --build
```

### Stop all services

```bash
docker compose down
```

### View logs

```bash
docker compose logs -f                    # All services
docker compose logs -f api-gateway        # Specific service
```

### Rebuild a specific service

```bash
docker compose build api-gateway
docker compose up -d api-gateway
```

---

## API Endpoints

### Base URL: `http://localhost:3000`

| Method | Endpoint  | Description     |
| ------ | --------- | --------------- |
| GET    | `/`       | Welcome message |
| GET    | `/health` | Health check    |

### Users (`/users`)

| Method | Endpoint     | Description    |
| ------ | ------------ | -------------- |
| GET    | `/users`     | Get all users  |
| GET    | `/users/:id` | Get user by ID |
| POST   | `/users`     | Create user    |
| PUT    | `/users/:id` | Update user    |
| DELETE | `/users/:id` | Delete user    |

### Products (`/products`)

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/products`     | Get all products  |
| GET    | `/products/:id` | Get product by ID |
| POST   | `/products`     | Create product    |
| PUT    | `/products/:id` | Update product    |
| DELETE | `/products/:id` | Delete product    |

### Orders (`/orders`)

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | `/orders`     | Get all orders  |
| GET    | `/orders/:id` | Get order by ID |
| POST   | `/orders`     | Create order    |
| PUT    | `/orders/:id` | Update order    |
| DELETE | `/orders/:id` | Delete order    |

### Notifications (`/notifications`)

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| GET    | `/notifications`     | Get all notifications  |
| GET    | `/notifications/:id` | Get notification by ID |
| POST   | `/notifications`     | Create notification    |
| PUT    | `/notifications/:id` | Update notification    |
| DELETE | `/notifications/:id` | Delete notification    |

---

## Adding a New Microservice

### 1. Generate new app with NestJS CLI

```bash
nest generate app <app-name>
```

### 2. Create required files

#### `apps/<app-name>/package.json`

```json
{
  "name": "<app-name>",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/microservices": "^11.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@types/node": "^22.0.0",
    "typescript": "^5.7.2"
  }
}
```

#### `apps/<app-name>/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts"]
}
```

#### `apps/<app-name>/nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

#### `apps/<app-name>/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 300X, // Choose unique port
      },
    },
  );
  await app.listen();
  console.log('Service is running on port 300X');
}
bootstrap();
```

#### `apps/<app-name>/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### `apps/<app-name>/src/app.controller.ts`

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'get_items' })
  getItems() {
    return this.appService.getItems();
  }

  @MessagePattern({ cmd: 'get_item' })
  getItem(id: string) {
    return this.appService.getItem(id);
  }

  @MessagePattern({ cmd: 'create_item' })
  createItem(data: any) {
    return this.appService.createItem(data);
  }

  @MessagePattern({ cmd: 'update_item' })
  updateItem(payload: { id: string; data: any }) {
    return this.appService.updateItem(payload);
  }

  @MessagePattern({ cmd: 'delete_item' })
  deleteItem(id: string) {
    return this.appService.deleteItem(id);
  }
}
```

#### `apps/<app-name>/src/app.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private items: any[] = [];

  getItems() {
    return this.items;
  }

  getItem(id: string) {
    return this.items.find((item) => item.id === id);
  }

  createItem(data: any) {
    const newItem = { id: Date.now().toString(), ...data };
    this.items.push(newItem);
    return newItem;
  }

  updateItem(payload: { id: string; data: any }) {
    const index = this.items.findIndex((item) => item.id === payload.id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...payload.data };
      return this.items[index];
    }
    return null;
  }

  deleteItem(id: string) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }
}
```

#### `apps/<app-name>/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
ENV PORT=300X
ENV HOST=0.0.0.0
EXPOSE 300X
CMD ["dist/main.js"]
```

### 3. Add to Docker Compose

```yaml
# docker-compose.yml
new-service:
  build:
    context: ./apps/new-service
    dockerfile: Dockerfile
  ports:
    - '300X:300X'
  environment:
    - PORT=300X
    - HOST=0.0.0.0
  networks:
    - microservices-network
```

Also update `api-gateway`:

```yaml
api-gateway:
  environment:
    - NEW_SERVICE_HOST=new-service
    - NEW_SERVICE_PORT=300X
  depends_on:
    - new-service
```

### 4. Register in API Gateway

#### `apps/api-gateway/src/app.module.ts`

```typescript
ClientsModule.register([
  // ... existing services
  {
    name: 'NEW_SERVICE',
    transport: Transport.TCP,
    options: {
      host: process.env.NEW_SERVICE_HOST ?? '127.0.0.1',
      port: parseInt(process.env.NEW_SERVICE_PORT ?? '300X'),
    },
  },
]),
```

#### Create `apps/api-gateway/src/controllers/new.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('new-items')
export class NewController {
  constructor(@Inject('NEW_SERVICE') private service: ClientProxy) {}

  @Get()
  async getAll() {
    return firstValueFrom(this.service.send({ cmd: 'get_items' }, {}));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return firstValueFrom(this.service.send({ cmd: 'get_item' }, id));
  }

  @Post()
  async create(@Body() data: any) {
    return firstValueFrom(this.service.send({ cmd: 'create_item' }, data));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return firstValueFrom(
      this.service.send({ cmd: 'update_item' }, { id, data }),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.service.send({ cmd: 'delete_item' }, id));
  }
}
```

### 5. Install & Run

```bash
cd apps/new-service && pnpm install
docker compose up --build
```

---

## Environment Variables

### API Gateway

| Variable                    | Default   | Description               |
| --------------------------- | --------- | ------------------------- |
| `PORT`                      | 3000      | HTTP port                 |
| `USER_SERVICE_HOST`         | 127.0.0.1 | User service host         |
| `USER_SERVICE_PORT`         | 3001      | User service port         |
| `PRODUCT_SERVICE_HOST`      | 127.0.0.1 | Product service host      |
| `PRODUCT_SERVICE_PORT`      | 3002      | Product service port      |
| `ORDER_SERVICE_HOST`        | 127.0.0.1 | Order service host        |
| `ORDER_SERVICE_PORT`        | 3003      | Order service port        |
| `NOTIFICATION_SERVICE_HOST` | 127.0.0.1 | Notification service host |
| `NOTIFICATION_SERVICE_PORT` | 3004      | Notification service port |

### Microservices

| Variable | Default | Description              |
| -------- | ------- | ------------------------ |
| `PORT`   | varies  | TCP port for the service |
| `HOST`   | 0.0.0.0 | Host to bind to          |

---

## Common Dependencies

| Package    | Command                                                       | Purpose               |
| ---------- | ------------------------------------------------------------- | --------------------- |
| Validation | `pnpm add class-validator class-transformer`                  | DTO validation        |
| Config     | `pnpm add @nestjs/config`                                     | Environment variables |
| PostgreSQL | `pnpm add @nestjs/typeorm typeorm pg`                         | Database              |
| MongoDB    | `pnpm add @nestjs/mongoose mongoose`                          | Database              |
| Swagger    | `pnpm add @nestjs/swagger`                                    | API documentation     |
| JWT Auth   | `pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt` | Authentication        |

---

## Docker Commands

### Build with Docker Compose

```bash
# Build all images
docker compose build

# Build specific service
docker compose build api-gateway

# View images
docker images | grep k8s

# View running containers
docker compose ps

# View logs
docker compose logs -f

# Stop all
docker compose down

# Remove all images
docker compose down --rmi all
```

### Build with Docker CLI

```bash
# Build individual images
docker build -t api-gateway:latest ./apps/api-gateway
docker build -t user-service:latest ./apps/user-service
docker build -t product-service:latest ./apps/product-service
docker build -t order-service:latest ./apps/order-service
docker build -t notification-service:latest ./apps/notification-service
```

### Tag Images

```bash
# Tag for registry (replace YOUR_REGISTRY with your registry URL)
docker tag api-gateway:latest YOUR_REGISTRY/api-gateway:v1.0.0
docker tag user-service:latest YOUR_REGISTRY/user-service:v1.0.0
docker tag product-service:latest YOUR_REGISTRY/product-service:v1.0.0
docker tag order-service:latest YOUR_REGISTRY/order-service:v1.0.0
docker tag notification-service:latest YOUR_REGISTRY/notification-service:v1.0.0
```

---

## Kubernetes Deployment

ดูคู่มือการ deploy บน Kubernetes ได้ที่ [k8s/README.md](./k8s/README.md)

---

## License

UNLICENSED
