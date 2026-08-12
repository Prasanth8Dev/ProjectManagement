import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(searchDto: SearchDto) {
    const { q, type = 'all', limit = 20 } = searchDto;

    if (!q || q.trim().length === 0) {
      return { tasks: [], projects: [], members: [] };
    }

    const results: { tasks: unknown[]; projects: unknown[]; members: unknown[] } = {
      tasks: [],
      projects: [],
      members: [],
    };

    const perTypeLimit = type === 'all' ? Math.ceil(limit / 3) : limit;

    if (type === 'all' || type === 'tasks') {
      results.tasks = await this.searchRepository.searchTasks(q, perTypeLimit);
    }

    if (type === 'all' || type === 'projects') {
      results.projects = await this.searchRepository.searchProjects(q, perTypeLimit);
    }

    if (type === 'all' || type === 'members') {
      results.members = await this.searchRepository.searchUsers(q, perTypeLimit);
    }

    return results;
  }
}
