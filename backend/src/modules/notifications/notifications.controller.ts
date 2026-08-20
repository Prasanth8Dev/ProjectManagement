import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationFilterDto } from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List a user's notifications (paginated, newest first)" })
  @ApiQuery({ name: 'userId', required: true, type: 'string' })
  findForUser(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query() filterDto: NotificationFilterDto,
  ) {
    return this.notificationsService.findForUser(userId, filterDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: "Get a user's unread notification count" })
  @ApiQuery({ name: 'userId', required: true, type: 'string' })
  unreadCount(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.notificationsService.unreadCount(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all of a user\'s notifications as read' })
  @ApiQuery({ name: 'userId', required: true, type: 'string' })
  markAllRead(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  markRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markRead(id);
  }
}
