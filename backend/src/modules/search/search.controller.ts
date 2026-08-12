import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Global search across tasks, projects, and members',
    description: 'Search by query string with optional type filter: all, tasks, projects, members',
  })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  search(@Query() searchDto: SearchDto) {
    return this.searchService.search(searchDto);
  }
}
