export interface InterventionUser {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface InterventionEntityRef {
  id: string;
  title: string;
}

export interface Intervention {
  id: string;
  taskId?: string | null;
  bugId?: string | null;
  employeeId: string;
  managerId: string;
  note: string;
  createdAt: string;
  employee: InterventionUser;
  manager: InterventionUser;
  task?: InterventionEntityRef | null;
  bug?: InterventionEntityRef | null;
}
