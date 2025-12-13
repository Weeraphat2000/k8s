import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OrderDocument } from './model/order.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './model/order.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  @Post('create-order')
  async createOrder() {
    console.log('create orders');
    const newOrder = new this.orderModel({
      name: 'Sample Order',
      quantity: 1,
      price: 100,
    });
    return newOrder.save();
  }

  @Get('get-orders')
  async getOrders() {
    console.log('get orders');
    return this.orderModel.find().exec();
  }

  @Get()
  getHello(): string {
    console.log('get hello');
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    console.log('call health');
    return { status: 'ok', service: 'api-gateway' };
  }
}
