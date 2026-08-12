import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type { Attachment, AttachmentEntityType } from '@/types/attachment.types';

export interface UploadAttachmentInput {
  file: File;
  entityType: AttachmentEntityType;
  entityId: string;
}

export async function getTaskAttachments(taskId: string): Promise<Attachment[]> {
  return api.get(`/tasks/${taskId}/attachments`);
}

export async function uploadAttachment(data: UploadAttachmentInput): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('entityType', data.entityType);
  formData.append('entityId', data.entityId);
  return api.post('/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function downloadAttachment(id: string): Promise<Blob> {
  return api.get(`/attachments/${id}/download`, { responseType: 'blob' });
}

export async function deleteAttachment(id: string): Promise<void> {
  return api.delete(`/attachments/${id}`);
}
