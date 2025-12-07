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

export class CreateProductDto {
  // Add your product properties here
  [key: string]: any;
}

export class UpdateProductDto {
  // Add your product properties here
  [key: string]: any;
}

@Controller('products')
export class ProductController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Get()
  async findAll(): Promise<any> {
    return firstValueFrom(
      this.productClient.send({ cmd: 'find_all_products' }, {}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return firstValueFrom(
      this.productClient.send({ cmd: 'find_product' }, { id }),
    );
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<any> {
    return firstValueFrom(
      this.productClient.send({ cmd: 'create_product' }, createProductDto),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<any> {
    return firstValueFrom(
      this.productClient.send(
        { cmd: 'update_product' },
        { id, ...updateProductDto },
      ),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return firstValueFrom(
      this.productClient.send({ cmd: 'delete_product' }, { id }),
    );
  }
}
