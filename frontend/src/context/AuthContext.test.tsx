import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useAuth } from '../context/AuthContext';

describe('AuthContext', () => {
  it('throws when useAuth is used outside provider', () => {
    const Broken = () => {
      useAuth();
      return null;
    };

    expect(() => render(<Broken />)).toThrow('useAuth must be used within AuthProvider');
  });
});
