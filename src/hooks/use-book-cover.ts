"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getBookCover as getOpenLibraryCover,
  getCachedCover as getCachedOpenLibraryCover,
  CoverSize as OpenLibraryCoverSize,
  clearCoverCache as clearOpenLibraryCache,
} from '@/lib/api/open-library';
import {
  getBookCover as getGoogleBooksCover,
  getCachedCover as getCachedGoogleBooksCover,
  CoverSize as GoogleBooksCoverSize,
  clearCoverCache as clearGoogleBooksCache,
} from '@/lib/api/google-books';

export interface UseBookCoverOptions {
  size?: 'S' | 'M' | 'L';
  enabled?: boolean;
  fallbackUrl?: string;
  source?: 'openlibrary' | 'googlebooks' | 'auto';
}

export interface UseBookCoverReturn {
  coverUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  source: 'openlibrary' | 'googlebooks' | 'local' | null;
}

/**
 * Хук для получения обложки книги из Open Library API с резервным источником Google Books API
 * 
 * @param title - Название книги
 * @param author - Автор книги (опционально)
 * @param isbn - ISBN книги (опционально)
 * @param options - Опции хука
 * 
 * @example
 * const { coverUrl, isLoading, source } = useBookCover(
 *   "Размышления",
 *   "Марк Аврелий",
 *   "9780140449334",
 *   { size: 'M', fallbackUrl: '/default-cover.jpg' }
 * );
 */
export function useBookCover(
  title: string,
  author?: string,
  isbn?: string,
  options: UseBookCoverOptions = {}
): UseBookCoverReturn {
  const {
    size = 'M',
    enabled = true,
    fallbackUrl,
    source = 'auto',
  } = options;

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [coverSource, setCoverSource] = useState<'openlibrary' | 'googlebooks' | 'local' | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const fetchCover = useCallback(async () => {
    if (!enabled || !title) return;

    setIsLoading(true);
    setError(null);

    try {
      // Создаём уникальный ключ для кэша
      const cacheKey = `${title}-${author || ''}-${isbn || ''}-${size}`;
      
      let cover: string | null = null;
      let foundSource: 'openlibrary' | 'googlebooks' | null = null;

      // Определяем порядок источников
      const sources = source === 'auto' 
        ? ['openlibrary', 'googlebooks'] 
        : [source];

      // Пробуем каждый источник по порядку
      for (const src of sources) {
        if (src === 'openlibrary') {
          cover = await getCachedOpenLibraryCover(
            cacheKey,
            title,
            author,
            isbn,
            size as OpenLibraryCoverSize
          );
          if (cover) {
            foundSource = 'openlibrary';
            break;
          }
        } else if (src === 'googlebooks') {
          cover = await getCachedGoogleBooksCover(
            cacheKey,
            title,
            author,
            isbn,
            size as GoogleBooksCoverSize
          );
          if (cover) {
            foundSource = 'googlebooks';
            break;
          }
        }
      }

      if (cover) {
        setCoverUrl(cover);
        setCoverSource(foundSource);
      } else {
        setCoverUrl(fallbackUrl || null);
        setCoverSource('local');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cover'));
      setCoverUrl(fallbackUrl || null);
      setCoverSource('local');
    } finally {
      setIsLoading(false);
    }
  }, [title, author, isbn, size, enabled, fallbackUrl, source]);

  useEffect(() => {
    fetchCover();
  }, [fetchCover]);

  const refetch = useCallback(() => {
    setRefetchKey(prev => prev + 1);
  }, []);

  return {
    coverUrl,
    isLoading,
    error,
    refetch,
    source: coverSource,
  };
}

/**
 * Хук для получения обложек нескольких книг
 */
export function useBookCovers(
  books: Array<{
    title: string;
    author?: string;
    isbn?: string;
  }>,
  options: UseBookCoverOptions = {}
): Array<UseBookCoverReturn> {
  const [covers, setCovers] = useState<Array<UseBookCoverReturn>>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.all(
        books.map(async (book) => {
          const cacheKey = `${book.title}-${book.author || ''}-${book.isbn || ''}-${options.size || 'M'}`;
          
          let cover: string | null = null;
          let foundSource: 'openlibrary' | 'googlebooks' | null = null;

          // Пробуем Open Library
          cover = await getCachedOpenLibraryCover(
            cacheKey,
            book.title,
            book.author,
            book.isbn,
            options.size as OpenLibraryCoverSize
          );
          if (cover) {
            foundSource = 'openlibrary';
          } else {
            // Пробуем Google Books
            cover = await getCachedGoogleBooksCover(
              cacheKey,
              book.title,
              book.author,
              book.isbn,
              options.size as GoogleBooksCoverSize
            );
            if (cover) {
              foundSource = 'googlebooks';
            }
          }

          return {
            coverUrl: cover || options.fallbackUrl || null,
            isLoading: false,
            error: null,
            refetch: () => {},
            source: (foundSource || 'local') as 'openlibrary' | 'googlebooks' | 'local',
          };
        })
      );

      setCovers(results);
    };

    if (books.length > 0) {
      fetchAll();
    }
  }, [JSON.stringify(books), options.size, options.fallbackUrl]);

  return covers;
}

export { clearOpenLibraryCache, clearGoogleBooksCache };
