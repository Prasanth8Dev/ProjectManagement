import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DailyUpdatesService } from './daily-updates.service';
import {
  CreateDailyUpdateDto,
  UpdateDailyUpdateDto,
  DailyUpdateFilterDto,
} from './dto/daily-update.dto';

@ApiTags('Daily Updates')
@Controller('daily-updates')
export class DailyUpdatesController {
  constructor(private readonly dailyUpdatesService: DailyUpdatesService) {}

  @Get()
  @ApiOperation({ summary: 'List daily work updates with filtering' })
  @ApiResponse({ status: 200, description: 'Daily updates retrieved successfully' })
  findAll(@Query() filterDto: DailyUpdateFilterDto) {
    return this.dailyUpdatesService.findAll(filterDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a daily work update' })
  @ApiResponse({ status: 201, description: 'Daily update created successfully' })
  @ApiResponse({ status: 409, description: 'Update already exists for this user and date' })
  create(@Body() createDto: CreateDailyUpdateDto) {
    return this.dailyUpdatesService.create(createDto);
  }

  @Get('report/daily')
  @ApiOperation({ summary: 'Get daily report: all updates for a date (default today)' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'ISO date string' })
  @ApiResponse({ status: 200, description: 'Daily report retrieved' })
  getDailyReport(@Query('date') date?: string) {
    return this.dailyUpdatesService.getDailyReport(date);
  }

  @Get('report/weekly')
  @ApiOperation({ summary: 'Get weekly report: all updates for the week' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'ISO date within desired week' })
  @ApiResponse({ status: 200, description: 'Weekly report retrieved' })
  getWeeklyReport(@Query('date') date?: string) {
    return this.dailyUpdatesService.getWeeklyReport(date);
  }

  @Get('today/:userId')
  @ApiOperation({ summary: "Get today's update for a specific user" })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: "Today's update retrieved" })
  @ApiResponse({ status: 404, description: 'No update found for today' })
  findTodayForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.dailyUpdatesService.findTodayForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get daily update by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Daily update retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dailyUpdatesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a daily work update' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Daily update modified successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDailyUpdateDto,
  ) {
    return this.dailyUpdatesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a daily update' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Daily update deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.dailyUpdatesService.delete(id);
  }
}
