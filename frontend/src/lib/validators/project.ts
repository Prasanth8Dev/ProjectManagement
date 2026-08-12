// Re-export from canonical schema file
export {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from './project.schema';

// Some pages import CreateProjectFormValues — alias to CreateProjectInput
export type { CreateProjectInput as CreateProjectFormValues } from './project.schema';
