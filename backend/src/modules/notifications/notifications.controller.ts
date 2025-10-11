import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('test')
  async sendTestEmail(
    @GetUser() user: any,
    @Body() body: { type: 'cv-parsed' | 'export-ready' | 'tailor-complete' },
  ) {
    switch (body.type) {
      case 'cv-parsed':
        await this.notificationsService.notifyCvParsed(user, {
          originalFileName: 'test-cv.pdf',
        } as any);
        break;
      case 'export-ready':
        await this.notificationsService.notifyExportReady(
          user,
          'test-cv.pdf',
          'pdf',
        );
        break;
      case 'tailor-complete':
        await this.notificationsService.notifyTailorComplete(
          user,
          'Senior Full Stack Developer',
        );
        break;
    }

    return { message: 'Test email sent' };
  }
}

