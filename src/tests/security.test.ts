import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeText, escapeHTML, sanitizeURL, createSafeHTML } from '@/lib/security/sanitize';

describe('Security - XSS Protection', () => {
  describe('sanitizeHTML', () => {
    it('должен удалять опасные теги', () => {
      const dirty = '<script>alert("XSS")</script><p>Безопасный текст</p>';
      const clean = sanitizeHTML(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('Безопасный текст');
    });

    it('должен удалять event handlers', () => {
      const dirty = '<div onclick="alert(1)">Текст</div>';
      const clean = sanitizeHTML(dirty);
      expect(clean).not.toContain('onclick');
    });

    it('должен разрешать безопасные теги', () => {
      const dirty = '<p><strong>Жирный</strong> и <em>курсив</em></p>';
      const clean = sanitizeHTML(dirty);
      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
    });

    it('должен удалять javascript: URI', () => {
      const dirty = '<a href="javascript:alert(1)">Ссылка</a>';
      const clean = sanitizeHTML(dirty);
      expect(clean).not.toContain('javascript:');
    });

    it('должен обрабатывать пустые значения', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('должен удалять все HTML теги', () => {
      const dirty = '<script>alert("XSS")</script>Текст';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('alert("XSS")Текст');
    });

    it('должен удалять HTML сущности', () => {
      const dirty = 'Текст &lt;script&gt;';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Текст script'); // &lt; и &gt; удаляются, остаётся текст
    });

    it('должен обрабатывать пустые значения', () => {
      expect(sanitizeText('')).toBe('');
      expect(sanitizeText(null as any)).toBe('');
    });
  });

  describe('escapeHTML', () => {
    it('должен экранировать специальные символы', () => {
      const input = '<script>&"</script>';
      const escaped = escapeHTML(input);
      expect(escaped).toBe('&lt;script&gt;&amp;&quot;&lt;/script&gt;');
    });

    it('должен экранировать одиночные кавычки', () => {
      const input = "It's safe";
      const escaped = escapeHTML(input);
      expect(escaped).toContain('&#039;');
    });

    it('должен обрабатывать пустые значения', () => {
      expect(escapeHTML('')).toBe('');
    });
  });

  describe('sanitizeURL', () => {
    it('должен разрешать https URL', () => {
      const url = 'https://example.com';
      expect(sanitizeURL(url)).toMatch(/^https:\/\/example\.com\/?$/);
    });

    it('должен разрешать относительные URL', () => {
      expect(sanitizeURL('/path')).toBe('/path');
      expect(sanitizeURL('#anchor')).toBe('#anchor');
    });

    it('должен блокировать javascript: URI', () => {
      const url = 'javascript:alert(1)';
      expect(sanitizeURL(url)).toBe('');
    });

    it('должен блокировать data: URI с кодом', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      expect(sanitizeURL(url)).toBe('');
    });

    it('должен обрабатывать пустые значения', () => {
      expect(sanitizeURL('')).toBe('');
    });
  });

  describe('createSafeHTML', () => {
    it('должен создавать объект для dangerouslySetInnerHTML', () => {
      const dirty = '<script>alert(1)</script><p>Безопасно</p>';
      const safe = createSafeHTML(dirty);
      expect(safe).toHaveProperty('__html');
      expect(safe.__html).not.toContain('<script>');
      expect(safe.__html).toContain('Безопасно');
    });
  });
});
