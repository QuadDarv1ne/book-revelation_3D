"use client";

import {useState, useEffect, useCallback} from 'react';
import {
  getCachedCover as getCachedOpenLibraryCover,
  OpenLibraryCoverSizeType,
} from '@/lib/api/open-library';
import {
  getCachedCover as getCachedGoogleBooksCover,
  GoogleBooksCoverSizeType,
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

  const fetchCover = useCallback(async () => {
    if (!enabled || !title) return;

    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `${title}-${author || ''}-${isbn || ''}-${size}`;

      let cover: string | null = null;
      let foundSource: 'openlibrary' | 'googlebooks' | null = null;

      const sources = source === 'auto'
        ? ['openlibrary', 'googlebooks']
        : [source];

      for (const src of sources) {
        if (src === 'openlibrary') {
          cover = await getCachedOpenLibraryCover(
            cacheKey,
            title,
            author,
            isbn,
            size as OpenLibraryCoverSizeType
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
            size as GoogleBooksCoverSizeType
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
    } finally {
      setIsLoading(false);
    }
  }, [title, author, isbn, size, enabled, fallbackUrl, source]);

  const refetch = useCallback(() => {
    setCoverUrl(null);
    fetchCover();
  }, [fetchCover]);

  useEffect(() => {
    fetchCover();
  }, [fetchCover]);

  return {
    coverUrl,
    isLoading,
    error,
    refetch,
    source: coverSource,
  };
}
