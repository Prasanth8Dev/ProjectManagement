import api from './axios';
import type { Comment } from '@/types/comment.types';

export interface CreateCommentInput {
  content: string;
  parentId?: string;
  mentions?: string[];
  authorId: string;
}

export interface UpdateCommentInput {
  content: string;
}

export async function getComments(taskId: string): Promise<Comment[]> {
  return api.get(`/tasks/${taskId}/comments`);
}

export async function createComment(taskId: string, data: CreateCommentInput): Promise<Comment> {
  return api.post(`/tasks/${taskId}/comments`, data);
}

export async function updateComment(
  taskId: string,
  commentId: string,
  data: UpdateCommentInput
): Promise<Comment> {
  return api.patch(`/tasks/${taskId}/comments/${commentId}`, data);
}

export async function deleteComment(taskId: string, commentId: string): Promise<void> {
  return api.delete(`/tasks/${taskId}/comments/${commentId}`);
}
