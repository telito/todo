import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '../api/client';
import { ApiError } from '../types';

describe('apiRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed json on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      })
    );

    const result = await apiRequest<{ status: string }>('/api/health');
    expect(result.status).toBe('ok');
  });

  it('throws ApiError on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication required' }),
      })
    );

    await expect(apiRequest('/api/auth/me')).rejects.toEqual(
      new ApiError(401, 'Authentication required')
    );
  });

  it('handles 204 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      })
    );

    const result = await apiRequest<void>('/api/tasks/1', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });
});
