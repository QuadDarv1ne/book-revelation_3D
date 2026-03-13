import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBookCover, useBookCovers } from '@/hooks/use-book-cover';
import * as bookCoverApi from '@/lib/book-cover-api';

// Mock API module
vi.mock('@/lib/book-cover-api', () => ({
  searchBookCover: vi.fn(),
  getLocalBookCover: vi.fn((bookId: string) => `/book-covers/${bookId}.jpg`)
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = any;

describe('useBookCover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен загружать обложку при монтировании', async () => {
    const mockResult = {
      coverUrl: 'https://covers.openlibrary.org/b/id/123-M.jpg',
      highResUrl: 'https://covers.openlibrary.org/b/id/123-L.jpg',
      thumbnailUrl: 'https://covers.openlibrary.org/b/id/123-S.jpg',
      source: 'openlibrary' as const
    };

    (bookCoverApi.searchBookCover as MockFn).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useBookCover({ title: 'Test Book', author: 'Author' })
    );

    // Начальное состояние
    expect(result.current.loading).toBe(true);
    expect(result.current.cover).toBeNull();

    // После загрузки
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cover).toEqual(mockResult);
    expect(bookCoverApi.searchBookCover).toHaveBeenCalledWith(
      { title: 'Test Book', author: 'Author' },
      undefined
    );
  });

  it('не должен загружать обложку если autoSearch: false', () => {
    const { result } = renderHook(() =>
      useBookCover({ title: 'Test Book' }, { autoSearch: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.cover).toBeNull();
    expect(bookCoverApi.searchBookCover).not.toHaveBeenCalled();
  });

  it('должен использовать fallback на локальную обложку', async () => {
    (bookCoverApi.searchBookCover as MockFn).mockResolvedValue({
      coverUrl: null,
      highResUrl: null,
      thumbnailUrl: null,
      source: null
    });

    const { result } = renderHook(() =>
      useBookCover(
        { title: 'Test Book' },
        { fallbackToLocal: true }
      )
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cover?.source).toBe('local');
    expect(result.current.cover?.coverUrl).toBe('/book-covers/test-book.jpg');
  });

  it('должен обрабатывать ошибку загрузки', async () => {
    (bookCoverApi.searchBookCover as MockFn).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() =>
      useBookCover({ title: 'Test Book' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('должен перезагружать обложку через reload', async () => {
    const mockResult = {
      coverUrl: 'https://covers.openlibrary.org/b/id/123-M.jpg',
      highResUrl: 'https://covers.openlibrary.org/b/id/123-L.jpg',
      thumbnailUrl: 'https://covers.openlibrary.org/b/id/123-S.jpg',
      source: 'openlibrary' as const
    };

    (bookCoverApi.searchBookCover as MockFn).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useBookCover({ title: 'Test Book' }, { autoSearch: false })
    );

    // Перезагрузка
    result.current.reload();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(bookCoverApi.searchBookCover).toHaveBeenCalledTimes(1);
  });

  it('должен использовать preferSource', async () => {
    const mockResult = {
      coverUrl: 'https://books.google.com/cover.jpg',
      source: 'googlebooks' as const
    };

    (bookCoverApi.searchBookCover as MockFn).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useBookCover(
        { title: 'Test Book' },
        { preferSource: 'googlebooks' }
      )
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(bookCoverApi.searchBookCover).toHaveBeenCalledWith(
      { title: 'Test Book' },
      'googlebooks'
    );
  });
});

describe('useBookCovers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен загружать несколько обложек', async () => {
    const queries = [
      { title: 'Book 1', author: 'Author 1' },
      { title: 'Book 2', author: 'Author 2' }
    ];

    const mockResults = [
      {
        coverUrl: 'https://covers.openlibrary.org/b/id/1-M.jpg',
        source: 'openlibrary' as const
      },
      {
        coverUrl: 'https://covers.openlibrary.org/b/id/2-M.jpg',
        source: 'openlibrary' as const
      }
    ];

    (bookCoverApi.searchBookCover as MockFn)
      .mockResolvedValueOnce(mockResults[0])
      .mockResolvedValueOnce(mockResults[1]);

    const { result } = renderHook(() => useBookCovers(queries));

    // Начальное состояние
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.covers.size).toBe(2);
    expect(result.current.getCover(queries[0])).toEqual(mockResults[0]);
    expect(result.current.getCover(queries[1])).toEqual(mockResults[1]);
  });

  it('должен собирать ошибки при загрузке', async () => {
    const queries = [
      { title: 'Book 1' },
      { title: 'Book 2' }
    ];

    (bookCoverApi.searchBookCover as MockFn)
      .mockResolvedValueOnce({ coverUrl: null, source: null })
      .mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useBookCovers(queries));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.errors.size).toBe(1);
  });
});
