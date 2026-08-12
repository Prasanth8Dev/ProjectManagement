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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BugsService } from './bugs.service';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { BugFilterDto, AssignBugDto, ChangeBugStatusDto } from './dto/bug-filter.dto';

@ApiTags('Bugs')
@Controller('bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Get()
  @ApiOperation({ summary: 'List all bugs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Bugs retrieved successfully' })
  findAll(@Query() filterDto: BugFilterDto) {
    return this.bugsService.findAll(filterDto);
  }

  @Post()
  @ApiOperation({ summary: 'Report a new bug' })
  @ApiResponse({ status: 201, description: 'Bug reported successfully' })
  create(@Body() createBugDto: CreateBugDto) {
    return this.bugsService.create(createBugDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bug by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bug retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bug not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bugsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bug' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Bug updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBugDto: UpdateBugDto,
  ) {
    return this.bugsService.update(id, updateBugDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bug' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Bug deleted successfully' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.bugsService.delete(id);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign bug to a user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignBugDto,
  ) {
    return this.bugsService.assign(id, assignDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change bug status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: ChangeBugStatusDto,
  ) {
    return this.bugsService.changeStatus(id, statusDto);
  }
}
