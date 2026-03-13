import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchOpenLibrary,
  searchGoogleBooks,
  searchBookCover,
  getLocalBookCover,
  getCachedBookCover,
  clearCoverCache,
  type BookSearchQuery
} from '@/lib/book-cover-api';

// Mock fetch
global.fetch = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFetch = any;

describe('Book Cover API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCoverCache();
  });

  describe('searchOpenLibrary', () => {
    it('должен найти обложку по названию и автору', async () => {
      const mockResponse = {
        entries: [
          {
            title: 'Meditations',
            cover_i: 12345,
            authors: [{ name: 'Marcus Aurelius' }]
          }
        ]
      };

      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await searchOpenLibrary({
        title: 'Meditations',
        author: 'Marcus Aurelius'
      });

      expect(result.source).toBe('openlibrary');
      expect(result.coverUrl).toContain('covers.openlibrary.org');
      expect(result.coverUrl).toContain('12345');
    });

    it('должен вернуть null если обложка не найдена', async () => {
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] })
      });

      const result = await searchOpenLibrary({
        title: 'NonExistent Book'
      });

      expect(result.coverUrl).toBeNull();
      expect(result.source).toBeNull();
    });

    it('должен найти обложку по ISBN', async () => {
      const mockResponse = {
        cover_id: 67890,
        title: 'Test Book',
        authors: [{ name: 'Test Author' }]
      };

      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await searchOpenLibrary({
        title: 'Test Book',
        isbn: '9781234567890'
      });

      expect(result.source).toBe('openlibrary');
      expect(result.coverUrl).toContain('67890');
    });

    it('должен обработать ошибку API', async () => {
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: false
      });

      const result = await searchOpenLibrary({
        title: 'Error Test'
      });

      expect(result.coverUrl).toBeNull();
    });
  });

  describe('searchGoogleBooks', () => {
    it('должен найти обложку в Google Books', async () => {
      const mockResponse = {
        items: [
          {
            volumeInfo: {
              title: 'The Theory of Everything',
              authors: ['Stephen Hawking'],
              imageLinks: {
                thumbnail: 'https://books.google.com/books/pixel?zoom=1',
                smallThumbnail: 'https://books.google.com/books/pixel?zoom=1',
                medium: 'https://books.google.com/books/pixel?zoom=2',
                large: 'https://books.google.com/books/pixel?zoom=3'
              },
              publisher: 'Bantam',
              publishedDate: '2002'
            }
          }
        ]
      };

      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await searchGoogleBooks({
        title: 'The Theory of Everything',
        author: 'Stephen Hawking'
      });

      expect(result.source).toBe('googlebooks');
      expect(result.coverUrl).toBeTruthy();
      expect(result.title).toBe('The Theory of Everything');
      expect(result.author).toBe('Stephen Hawking');
    });

    it('должен вернуть null если книга не найдена', async () => {
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
      });

      const result = await searchGoogleBooks({
        title: 'NonExistent Book'
      });

      expect(result.coverUrl).toBeNull();
      expect(result.source).toBeNull();
    });

    it('должен вернуть null если нет imageLinks', async () => {
      const mockResponse = {
        items: [
          {
            volumeInfo: {
              title: 'Book Without Cover',
              authors: ['Author']
            }
          }
        ]
      };

      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await searchGoogleBooks({
        title: 'Book Without Cover'
      });

      expect(result.coverUrl).toBeNull();
    });
  });

  describe('searchBookCover', () => {
    it('должен сначала искать в Open Library по умолчанию', async () => {
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entries: [{ cover_i: 123, title: 'Test' }]
        })
      });

      const result = await searchBookCover({
        title: 'Test Book'
      });

      expect(result.source).toBe('openlibrary');
    });

    it('должен искать в Google Books если указан preferSource', async () => {
      // Google Books находит с первого раза
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            volumeInfo: {
              title: 'Test Book',
              imageLinks: { 
                thumbnail: 'https://books.google.com/books/pixel?zoom=1',
                medium: 'https://books.google.com/cover.jpg'
              }
            }
          }]
        })
      });

      const result = await searchBookCover(
        { title: 'Test Book' },
        { preferSource: 'googlebooks' }
      );

      expect(result.source).toBe('googlebooks');
      expect(result.coverUrl).toBeTruthy();
    });

    it('должен fallback на другой источник если первый не нашёл', async () => {
      // Open Library не находит
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] })
      });

      // Google Books находит
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            volumeInfo: {
              title: 'Test Book',
              imageLinks: { thumbnail: 'https://books.google.com/cover.jpg' }
            }
          }]
        })
      });

      const result = await searchBookCover({ title: 'Test Book' });

      expect(result.source).toBe('googlebooks');
    });
  });

  describe('getLocalBookCover', () => {
    it('должен вернуть путь к локальной обложке', () => {
      const path = getLocalBookCover('marcus-aurelius-meditations');
      expect(path).toBe('/book-covers/marcus-aurelius-meditations.jpg');
    });
  });

  describe('getCachedBookCover', () => {
    it('должен кэшировать результаты', async () => {
      const mockResponse = {
        entries: [{ cover_i: 999, title: 'Cached Book' }]
      };

      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const query: BookSearchQuery = { title: 'Cached Book' };

      // Первый запрос
      const result1 = await getCachedBookCover(query);
      // Второй запрос (из кэша)
      const result2 = await getCachedBookCover(query);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1.coverUrl).toBe(result2.coverUrl);
    });

    it('должен очищать кэш', async () => {
      const mockOpenLibrary = {
        entries: [{ cover_i: 888, title: 'Book' }]
      };

      // Первый запрос - Open Library находит
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenLibrary
      });

      const query: BookSearchQuery = { title: 'Book' };

      await getCachedBookCover(query);
      
      // Очищаем кэш
      clearCoverCache();
      
      // Второй запрос после очистки - Open Library снова находит
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenLibrary
      });
      
      await getCachedBookCover(query);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
