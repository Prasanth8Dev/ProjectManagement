import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { Comment } from '@/types/comment.types';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  type CreateCommentInput,
  type UpdateCommentInput,
} from '@/lib/api/comments.api';

export const useComments = (taskId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.tasks.comments(taskId),
    queryFn: () => getComments(taskId),
    enabled: !!taskId,
    staleTime: 15_000,
    select: (d: any): Comment[] => d?.data ?? d,
  });

export const useCreateComment = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) => createComment(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.comments(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};

export const useUpdateComment = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentInput }) =>
      updateComment(taskId, commentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.comments(taskId) });
    },
  });
};

export const useDeleteComment = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(taskId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.comments(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};
