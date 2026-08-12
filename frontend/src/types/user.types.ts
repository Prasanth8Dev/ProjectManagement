export type UserRole = 'ADMIN' | 'MANAGER' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'VIEWER';

// Re-exported for convenience — canonical definition is in team.types.ts
export type { TeamMember } from './team.types';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  jobTitle?: string;
  department?: string;
  phone?: string;
  timezone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
