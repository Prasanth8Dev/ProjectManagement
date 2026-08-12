import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { Attachment } from '@/types/attachment.types';
import {
  getTaskAttachments,
  uploadAttachment,
  deleteAttachment,
  type UploadAttachmentInput,
} from '@/lib/api/attachments.api';

export const useTaskAttachments = (taskId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.tasks.attachments(taskId),
    queryFn: () => getTaskAttachments(taskId),
    enabled: !!taskId,
    staleTime: 30_000,
    select: (d: any): Attachment[] => d?.data ?? d,
  });

export const useUploadAttachment = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadAttachmentInput) => uploadAttachment(data),
    onSuccess: () => {
      if (taskId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.attachments(taskId) });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
      }
    },
  });
};

export const useDeleteAttachment = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      if (taskId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.attachments(taskId) });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
      }
    },
  });
};
