import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './controllers/user.controller';
import { ProductController } from './controllers/product.controller';
import { OrderController } from './controllers/order.controller';
import { NotificationController } from './controllers/notification.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
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
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST ?? '127.0.0.1',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT ?? '3004'),
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
