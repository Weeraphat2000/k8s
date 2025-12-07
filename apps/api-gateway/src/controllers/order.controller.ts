import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  @Get()
  async findAll(): Promise<any> {
    return firstValueFrom(
      this.orderClient.send({ cmd: 'find_all_orders' }, {}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return firstValueFrom(this.orderClient.send({ cmd: 'find_order' }, { id }));
  }

  @Post()
  async create(@Body() createOrderDto: any): Promise<any> {
    return firstValueFrom(
      this.orderClient.send({ cmd: 'create_order' }, createOrderDto),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: any,
  ): Promise<any> {
    return firstValueFrom(
      this.orderClient.send({ cmd: 'update_order' }, { id, ...updateOrderDto }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return firstValueFrom(
      this.orderClient.send({ cmd: 'delete_order' }, { id }),
    );
  }
}
