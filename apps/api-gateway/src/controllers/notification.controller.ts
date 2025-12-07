import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private notificationService: ClientProxy,
  ) {}

  @Get()
  async getNotifications(): Promise<any> {
    return firstValueFrom(this.notificationService.send({ cmd: 'ping' }, {}));
  }
}
