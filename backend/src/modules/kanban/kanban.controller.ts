import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { KanbanService } from './kanban.service';
import { MoveCardDto } from './dto/kanban.dto';

@ApiTags('Kanban')
@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get(':projectId')
  @ApiOperation({
    summary: 'Get Kanban board for a project',
    description: 'Returns columns with tasks grouped by status, including assignee, labels, checklist progress, and comment count',
  })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kanban board retrieved successfully' })
  getBoard(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.kanbanService.getBoard(projectId);
  }

  @Patch('move')
  @ApiOperation({
    summary: 'Move a task card to a new status/position',
    description: 'Updates task status and position, records history and activity log',
  })
  @ApiResponse({ status: 200, description: 'Card moved successfully' })
  moveCard(@Body() dto: MoveCardDto) {
    return this.kanbanService.moveCard(dto);
  }
}
