import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', true ? 'bar' : 'baz')).toBe('foo bar');
  });

  it('should handle tailwind merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle empty values', () => {
    expect(cn('foo', null, undefined, false)).toBe('foo');
  });
});
