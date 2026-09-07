export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  description: string;
  projectId: string;
  finishDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface DescriptionAssistantResult {
  description: string;
  source: 'openai' | 'fallback';
}

export interface TaskInsightResult {
  priority: TaskPriority;
  isOverdue: boolean;
  isRisky: boolean;
  summary: string;
  source: 'openai' | 'fallback';
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
