import type { User } from './user.types';

export interface Comment {
  id: string;
  taskId?: string | null;
  bugId?: string | null;
  content: string;
  mentions: string[];
  isEdited: boolean;
  editedAt?: string;
  author: User;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}
