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

@Controller('users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Get()
  async findAll(): Promise<any> {
    return firstValueFrom(this.userClient.send({ cmd: 'find_all_users' }, {}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return firstValueFrom(this.userClient.send({ cmd: 'find_user' }, { id }));
  }

  @Post()
  async create(@Body() createUserDto: any): Promise<any> {
    return firstValueFrom(
      this.userClient.send({ cmd: 'create_user' }, createUserDto),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
  ): Promise<any> {
    return firstValueFrom(
      this.userClient.send({ cmd: 'update_user' }, { id, ...updateUserDto }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return firstValueFrom(this.userClient.send({ cmd: 'delete_user' }, { id }));
  }
}
