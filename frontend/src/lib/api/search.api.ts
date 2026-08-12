import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type { TaskStatus } from '@/types/task.types';

export interface SearchParams {
  q: string;
  type?: 'task' | 'project' | 'user' | 'team' | 'all';
  limit?: number;
}

export interface SearchResult {
  tasks: Array<{ id: string; title: string; status: TaskStatus; project: { id: string; name: string } }>;
  projects: Array<{ id: string; name: string; status: string }>;
  users: Array<{ id: string; name: string; email: string; avatar?: string }>;
  teams: Array<{ id: string; name: string }>;
}

export async function searchAll(params: SearchParams): Promise<ApiResponse<SearchResult>> {
  return api.get('/search', { params });
}
