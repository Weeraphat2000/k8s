import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'find_all_users' })
  findAll() {
    return this.userService.findAll();
  }

  @MessagePattern({ cmd: 'find_user' })
  findOne(@Payload() data: { id: string }) {
    return this.userService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'create_user' })
  create(@Payload() data: any) {
    return this.userService.create(data);
  }

  @MessagePattern({ cmd: 'update_user' })
  update(@Payload() data: { id: string } & any) {
    const { id, ...updateData } = data;
    return this.userService.update(id, updateData);
  }

  @MessagePattern({ cmd: 'delete_user' })
  remove(@Payload() data: { id: string }) {
    return this.userService.remove(data.id);
  }
}
