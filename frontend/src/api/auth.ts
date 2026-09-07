import { apiRequest } from './client';
import { User } from '../types';

export const register = (email: string, password: string) =>
  apiRequest<{ user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const login = (email: string, password: string) =>
  apiRequest<{ user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  apiRequest<{ message: string }>('/api/auth/logout', { method: 'POST' });

export const getMe = () => apiRequest<{ user: User }>('/api/auth/me');
