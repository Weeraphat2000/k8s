import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq:5672',
        ],
        queue: 'notification_queue',
        queueOptions: {
          durable: true,
        },
        prefetchCount: 1, // ให้แต่ละ consumer รับทีละ 1 message เพื่อกระจาย load
      },
    },
  );
  await app.listen();
  console.log(
    `Notification Service is running with RabbitMQ (Pod: ${process.env.HOSTNAME})`,
  );
}
bootstrap();
