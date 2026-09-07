import { apiRequest } from './client';
import { Project } from '../types';

export const fetchProjects = () =>
  apiRequest<{ projects: Project[] }>('/api/projects');

export const createProject = (name: string) =>
  apiRequest<{ project: Project }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const updateProject = (id: string, name: string) =>
  apiRequest<{ project: Project }>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

export const deleteProject = (id: string) =>
  apiRequest<void>(`/api/projects/${id}`, { method: 'DELETE' });
