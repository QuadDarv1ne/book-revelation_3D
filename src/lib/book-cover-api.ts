/**
 * Book Cover API Client
 * Интеграция с Open Library и Google Books API для загрузки обложек книг
 */

export interface BookCoverResult {
  coverUrl: string | null;
  highResUrl: string | null;
  thumbnailUrl: string | null;
  source: 'openlibrary' | 'googlebooks' | 'local' | null;
  title?: string;
  author?: string;
  publisher?: string;
  publishedDate?: string;
}

export interface BookSearchQuery {
  title: string;
  author?: string;
  isbn?: string;
}

const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1';

/**
 * Поиск книги в Open Library
 */
export async function searchOpenLibrary(query: BookSearchQuery): Promise<BookCoverResult> {
  try {
    let searchUrl: string;
    
    if (query.isbn) {
      searchUrl = `${OPEN_LIBRARY_BASE}/isbn/${query.isbn}.json`;
    } else {
      const titleParam = encodeURIComponent(query.title);
      const authorParam = query.author ? `+author:${encodeURIComponent(query.author)}` : '';
      searchUrl = `${OPEN_LIBRARY_BASE}/search.json?q=title:${titleParam}${authorParam}&limit=1&fields=key,title,author,cover_i`;
    }

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'StoicBook3D/1.0 (https://github.com/book-revelation_3D)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
    }

    const data = await response.json();

    if (query.isbn) {
      // Прямой доступ по ISBN
      const coverId = data.cover_id;
      if (coverId) {
        const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        return {
          coverUrl,
          highResUrl: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
          thumbnailUrl: `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`,
          source: 'openlibrary',
          title: data.title,
          author: data.authors?.[0]?.name
        };
      }
    } else {
      // Поиск по названию
      const entries = data.entries || [];
      if (entries.length === 0) {
        return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
      }

      const book = entries.find((e: { cover_i?: number }) => e.cover_i) || entries[0];
      const coverId = book.cover_i;

      if (coverId) {
        return {
          coverUrl: `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`,
          highResUrl: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
          thumbnailUrl: `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`,
          source: 'openlibrary',
          title: book.title,
          author: book.authors?.[0]?.name
        };
      }
    }

    return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
  } catch (error) {
    console.error('Open Library API error:', error);
    return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
  }
}

/**
 * Поиск книги в Google Books API
 */
export async function searchGoogleBooks(query: BookSearchQuery): Promise<BookCoverResult> {
  try {
    let searchUrl = `${GOOGLE_BOOKS_BASE}/volumes?q=`;
    
    if (query.isbn) {
      searchUrl += `isbn:${query.isbn}`;
    } else {
      const titleParam = encodeURIComponent(`intitle:${query.title}`);
      const authorParam = query.author ? `+inauthor:${encodeURIComponent(query.author)}` : '';
      searchUrl += `${titleParam}${authorParam}`;
    }

    searchUrl += '&maxResults=1&printType=books';

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
    }

    const volume = data.items[0];
    const imageLinks = volume.volumeInfo?.imageLinks;

    if (!imageLinks) {
      return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
    }

    // Google Books возвращает разные размеры
    const thumbnailUrl = imageLinks.thumbnail?.replace('zoom=1', 'zoom=1') || null;
    const smallThumbnail = imageLinks.smallThumbnail || null;
    const medium = imageLinks.medium || null;
    const large = imageLinks.large || null;
    const extraLarge = imageLinks.extraLarge || null;

    return {
      coverUrl: medium || large || thumbnailUrl,
      highResUrl: extraLarge || large || medium,
      thumbnailUrl: smallThumbnail || thumbnailUrl,
      source: 'googlebooks',
      title: volume.volumeInfo?.title,
      author: volume.volumeInfo?.authors?.[0],
      publisher: volume.volumeInfo?.publisher,
      publishedDate: volume.volumeInfo?.publishedDate
    };
  } catch (error) {
    console.error('Google Books API error:', error);
    return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
  }
}

/**
 * Универсальный поиск обложки (сначала Open Library, потом Google Books)
 */
export async function searchBookCover(query: BookSearchQuery, preferSource?: 'openlibrary' | 'googlebooks'): Promise<BookCoverResult> {
  if (preferSource === 'googlebooks') {
    const googleResult = await searchGoogleBooks(query);
    if (googleResult.coverUrl) return googleResult;
    
    const openLibraryResult = await searchOpenLibrary(query);
    if (openLibraryResult.coverUrl) return openLibraryResult;
  } else {
    // По умолчанию сначала Open Library
    const openLibraryResult = await searchOpenLibrary(query);
    if (openLibraryResult.coverUrl) return openLibraryResult;
    
    const googleResult = await searchGoogleBooks(query);
    if (googleResult.coverUrl) return googleResult;
  }

  return { coverUrl: null, highResUrl: null, thumbnailUrl: null, source: null };
}

/**
 * Получить обложку для существующей книги из проекта
 */
export function getLocalBookCover(bookId: string): string {
  return `/book-covers/${bookId}.jpg`;
}

/**
 * Кэширование результатов поиска
 */
const coverCache = new Map<string, BookCoverResult>();

export async function getCachedBookCover(query: BookSearchQuery): Promise<BookCoverResult> {
  const cacheKey = `${query.title}-${query.author || ''}-${query.isbn || ''}`;
  
  if (coverCache.has(cacheKey)) {
    return coverCache.get(cacheKey)!;
  }

  const result = await searchBookCover(query);
  coverCache.set(cacheKey, result);
  
  return result;
}

/**
 * Очистка кэша
 */
export function clearCoverCache(): void {
  coverCache.clear();
}
