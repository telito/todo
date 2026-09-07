import { apiRequest } from './client';
import { DescriptionAssistantResult, TaskInsightResult } from '../types';

export const improveDescription = (title: string, roughDescription?: string) =>
  apiRequest<DescriptionAssistantResult>('/api/ai/improve-description', {
    method: 'POST',
    body: JSON.stringify({ title, roughDescription }),
  });

export const getTaskInsights = (description: string, finishDate?: string | null) =>
  apiRequest<TaskInsightResult>('/api/ai/insights', {
    method: 'POST',
    body: JSON.stringify({ description, finishDate }),
  });
