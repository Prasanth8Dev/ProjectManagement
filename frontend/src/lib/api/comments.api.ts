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

export async function getBugComments(bugId: string): Promise<Comment[]> {
  return api.get(`/bugs/${bugId}/comments`);
}

export async function createBugComment(bugId: string, data: CreateCommentInput): Promise<Comment> {
  return api.post(`/bugs/${bugId}/comments`, data);
}

// Edit/delete operate on a comment by its own id — the backend doesn't scope
// these routes under the parent task/bug, so no taskId/bugId is needed here.
export async function updateComment(
  commentId: string,
  data: UpdateCommentInput
): Promise<Comment> {
  return api.patch(`/comments/${commentId}`, data);
}

export async function deleteComment(commentId: string): Promise<void> {
  return api.delete(`/comments/${commentId}`);
}
