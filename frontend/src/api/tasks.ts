import { apiRequest } from './client';
import { Task } from '../types';

export const fetchTasks = () => apiRequest<{ tasks: Task[] }>('/api/tasks');

export const createTask = (
  projectId: string,
  description: string,
  finishDate?: string | null
) =>
  apiRequest<{ task: Task }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ projectId, description, finishDate }),
  });

export const updateTask = (
  id: string,
  data: { description?: string; finishDate?: string | null }
) =>
  apiRequest<{ task: Task }>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const completeTask = (id: string) =>
  apiRequest<{ task: Task }>(`/api/tasks/${id}/complete`, { method: 'PATCH' });

export const uncompleteTask = (id: string) =>
  apiRequest<{ task: Task }>(`/api/tasks/${id}/uncomplete`, { method: 'PATCH' });

export const deleteTask = (id: string) =>
  apiRequest<void>(`/api/tasks/${id}`, { method: 'DELETE' });
