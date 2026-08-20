import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { Comment } from '@/types/comment.types';
import {
  getComments,
  createComment,
  getBugComments,
  createBugComment,
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

export const useBugComments = (bugId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.bugs.comments(bugId),
    queryFn: () => getBugComments(bugId),
    enabled: !!bugId,
    staleTime: 15_000,
    select: (d: any): Comment[] => d?.data ?? d,
  });

export const useCreateBugComment = (bugId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) => createBugComment(bugId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.comments(bugId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.detail(bugId) });
    },
  });
};

// Shared by both tasks and bugs — comments are edited/deleted by their own
// id, not scoped under a parent. `invalidateKey` tells the cache which list
// to refresh afterwards.
export const useUpdateComment = (invalidateKey: readonly unknown[]) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentInput }) =>
      updateComment(commentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invalidateKey });
    },
  });
};

export const useDeleteComment = (invalidateKey: readonly unknown[], detailKey?: readonly unknown[]) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invalidateKey });
      if (detailKey) qc.invalidateQueries({ queryKey: detailKey });
    },
  });
};
