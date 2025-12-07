import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'find_all_products' })
  findAll() {
    return this.productService.findAll();
  }

  @MessagePattern({ cmd: 'find_product' })
  findOne(@Payload() data: { id: string }) {
    return this.productService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() data: any) {
    return this.productService.create(data);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(@Payload() data: { id: string } & any) {
    const { id, ...updateData } = data;
    return this.productService.update(id, updateData);
  }

  @MessagePattern({ cmd: 'delete_product' })
  remove(@Payload() data: { id: string }) {
    return this.productService.remove(data.id);
  }
}
