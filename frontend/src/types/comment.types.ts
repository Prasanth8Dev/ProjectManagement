import type { User } from './user.types';

export interface Comment {
  id: string;
  taskId: string;
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
