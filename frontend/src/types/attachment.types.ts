import type { User } from './user.types';

export type AttachmentEntityType = 'TASK' | 'PROJECT' | 'COMMENT' | 'DAILY_UPDATE';

export interface Attachment {
  id: string;
  fileName: string;
  originalName?: string;   // alias used by some components
  fileKey: string;
  fileUrl: string;
  url?: string;            // alias used by some components
  mimeType: string;
  fileSize: number;
  size?: number;           // alias used by some components
  entityType: AttachmentEntityType;
  uploader: User;
  uploadedBy?: User;       // alias used by some components
  createdAt: string;
}
