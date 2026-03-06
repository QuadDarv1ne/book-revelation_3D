import { describe, it, expect } from 'vitest';
import { quotes } from '@/data/quotes';
import type { Quote } from '@/types/quote';

describe('quotes', () => {
  it('should be an array', () => {
    expect(Array.isArray(quotes)).toBe(true);
  });

  it('should have at least 50 quotes', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(50);
  });

  it('should have valid quote structure', () => {
    quotes.forEach((quote: Quote) => {
      expect(quote).toHaveProperty('text');
      expect(quote).toHaveProperty('author');
      expect(quote).toHaveProperty('era');
      expect(typeof quote.text).toBe('string');
      expect(typeof quote.author).toBe('string');
      expect(typeof quote.era).toBe('string');
      expect(quote.text.length).toBeGreaterThan(0);
      expect(quote.author.length).toBeGreaterThan(0);
    });
  });

  it('should contain quotes from multiple philosophers', () => {
    const authors = quotes.map((q: Quote) => q.author);
    expect(authors).toContain('Марк Аврелий');
    expect(authors).toContain('Эпиктет');
    expect(authors).toContain('Сенека');
    expect(authors).toContain('Зенон Китийский');
  });
});
