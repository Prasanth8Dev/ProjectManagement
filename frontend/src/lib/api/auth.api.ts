import api from './axios';
import type { User } from '@/types/user.types';

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(data: LoginInput): Promise<User> {
  // The axios interceptor returns the NestJS envelope { success, data }.
  // Extract the nested `data` field to get the actual user object.
  const resp = await api.post('/auth/login', data);
  return (resp as any)?.data ?? resp;
}

export async function changePassword(
  userId: string,
  payload: { currentPassword: string; newPassword: string },
): Promise<{ message: string }> {
  return api.patch(`/users/${userId}/password`, payload);
}
