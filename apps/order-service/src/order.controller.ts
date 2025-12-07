import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'find_all_orders' })
  findAll() {
    return this.orderService.findAll();
  }

  @MessagePattern({ cmd: 'find_order' })
  findOne(@Payload() data: { id: string }) {
    return this.orderService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'create_order' })
  create(@Payload() data: any) {
    return this.orderService.create(data);
  }

  @MessagePattern({ cmd: 'update_order' })
  update(@Payload() data: { id: string } & any) {
    const { id, ...updateData } = data;
    return this.orderService.update(id, updateData);
  }

  @MessagePattern({ cmd: 'delete_order' })
  remove(@Payload() data: { id: string }) {
    return this.orderService.remove(data.id);
  }
}
