import api from './axios';
import type { User } from '@/types/user.types';
import type { Task } from '@/types/task.types';
import type { ActivityLog } from '@/types/activity.types';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api.types';

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role?: 'ADMIN' | 'MANAGER' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'VIEWER';
  jobTitle?: string;
  department?: string;
  phone?: string;
  timezone?: string;
  bio?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: 'ADMIN' | 'MANAGER' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'VIEWER';
  jobTitle?: string;
  department?: string;
  phone?: string;
  timezone?: string;
  bio?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export async function createUser(data: CreateUserInput): Promise<User> {
  return api.post('/users', data);
}

export async function getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
  return api.get('/users', { params });
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  return api.get(`/users/${id}`);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
  return api.patch(`/users/${id}`, data);
}

export async function getUserTasks(
  id: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Task>> {
  return api.get(`/users/${id}/tasks`, { params });
}

export async function getUserActivity(
  id: string,
  params?: PaginationParams
): Promise<PaginatedResponse<ActivityLog>> {
  return api.get(`/users/${id}/activity`, { params });
}
