import type { User } from './user.types';
import type { Project } from './project.types';

export type TeamMemberRole = 'LEAD' | 'MEMBER';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  avatar?: string;
  createdAt: string;
  members?: TeamMember[];
  projects?: Project[];
  _count?: {
    members: number;
    projects: number;
  };
}
