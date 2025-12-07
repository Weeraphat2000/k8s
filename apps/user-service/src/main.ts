import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST ?? '0.0.0.0',
        port: parseInt(process.env.PORT ?? '3001'),
      },
    },
  );
  await app.listen();
  console.log('User Service is running on port 3001');
}
bootstrap();
