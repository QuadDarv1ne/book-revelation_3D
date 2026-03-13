'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchBookCover, getLocalBookCover, type BookCoverResult, type BookSearchQuery } from '@/lib/book-cover-api';

export interface UseBookCoverOptions {
  autoSearch?: boolean;
  preferSource?: 'openlibrary' | 'googlebooks';
  fallbackToLocal?: boolean;
}

/**
 * Хук для загрузки обложек книг из API
 * @param query Параметры поиска (title, author, isbn)
 * @param options Опции загрузки
 */
export function useBookCover(
  query: BookSearchQuery | null,
  options: UseBookCoverOptions = {}
) {
  const {
    autoSearch = true,
    preferSource,
    fallbackToLocal = true
  } = options;

  const [cover, setCover] = useState<BookCoverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCover = useCallback(async () => {
    if (!query) {
      setCover(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchBookCover(query, preferSource);
      
      if (result.coverUrl) {
        setCover(result);
      } else if (fallbackToLocal && query.title) {
        // Fallback на локальную обложку
        const localCover = getLocalBookCover(
          query.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        );
        setCover({
          coverUrl: localCover,
          highResUrl: localCover,
          thumbnailUrl: localCover,
          source: 'local'
        });
      } else {
        setCover(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cover');
      if (fallbackToLocal && query.title) {
        const localCover = getLocalBookCover(
          query.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        );
        setCover({
          coverUrl: localCover,
          highResUrl: localCover,
          thumbnailUrl: localCover,
          source: 'local'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [query, preferSource, fallbackToLocal]);

  useEffect(() => {
    if (autoSearch && query) {
      loadCover();
    }
  }, [autoSearch, query, loadCover]);

  return {
    cover,
    loading,
    error,
    reload: loadCover
  };
}

/**
 * Хук для пакетной загрузки обложек нескольких книг
 */
export function useBookCovers(
  queries: BookSearchQuery[],
  options: UseBookCoverOptions = {}
) {
  const [covers, setCovers] = useState<Map<string, BookCoverResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function loadAllCovers() {
      setLoading(true);
      const newCovers = new Map<string, BookCoverResult>();
      const newErrors = new Map<string, string>();

      for (const query of queries) {
        const cacheKey = `${query.title}-${query.author || ''}`;
        try {
          const result = await searchBookCover(query, options.preferSource);
          if (result.coverUrl) {
            newCovers.set(cacheKey, result);
          }
        } catch (err) {
          newErrors.set(cacheKey, err instanceof Error ? err.message : 'Failed to load');
        }
      }

      setCovers(newCovers);
      setErrors(newErrors);
      setLoading(false);
    }

    loadAllCovers();
  }, [queries, options.preferSource]);

  return {
    covers,
    loading,
    errors,
    getCover: (query: BookSearchQuery) => {
      const key = `${query.title}-${query.author || ''}`;
      return covers.get(key);
    }
  };
}
