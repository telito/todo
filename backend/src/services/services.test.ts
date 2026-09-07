import {
  validateEmail,
  validatePassword,
  hashPassword,
  verifyPassword,
} from './authService';
import { buildFallbackDescription, improveTaskDescription, getTaskInsights } from './aiService';

describe('authService validators', () => {
  it('validates email format', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });

  it('validates password length', () => {
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('secret123')).toBe(true);
  });

  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('secret123');
    expect(await verifyPassword('secret123', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('aiService fallback', () => {
  it('builds a structured fallback description', () => {
    const result = buildFallbackDescription('Prepare release');
    expect(result).toContain('Prepare release');
    expect(result).toContain('Steps:');
  });

  it('improves description using fallback when no api key', async () => {
    const result = await improveTaskDescription('Prepare release');
    expect(result.source).toBe('fallback');
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('returns insights using fallback when no api key', async () => {
    const result = await getTaskInsights('Urgent fix', '2020-01-01T00:00:00.000Z');
    expect(result.source).toBe('fallback');
    expect(result.isOverdue).toBe(true);
  });
});
