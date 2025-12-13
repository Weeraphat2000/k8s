import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './controllers/user.controller';
import { ProductController } from './controllers/product.controller';
import { OrderController } from './controllers/order.controller';
import { NotificationController } from './controllers/notification.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './model/order.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost/nest',
    ),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),

    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST ?? '127.0.0.1',
          port: parseInt(process.env.USER_SERVICE_PORT ?? '3001'),
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST ?? '127.0.0.1',
          port: parseInt(process.env.PRODUCT_SERVICE_PORT ?? '3002'),
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ORDER_SERVICE_HOST ?? '127.0.0.1',
          port: parseInt(process.env.ORDER_SERVICE_PORT ?? '3003'),
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq:5672',
          ],
          queue: 'notification_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    UserController,
    ProductController,
    OrderController,
    NotificationController,
  ],
  providers: [AppService],
})
export class AppModule {}
