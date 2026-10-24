import type { User } from './user.types';

export interface BugHistoryEntry {
  id: string;
  bugId: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  user: User;
  createdAt: string;
}
