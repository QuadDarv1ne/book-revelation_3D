/**
 * Open Library API Client
 * 
 * Интеграция с Open Library Covers API для получения обложек книг
 * Документация: https://openlibrary.org/dev/docs/api/covers
 * 
 * Rate limits: 100 запросов на IP каждые 5 минут
 */

export interface OpenLibraryBook {
  key: string;
  title: string;
  authors?: { key: string }[];
  covers?: number[];
  identifiers?: {
    isbn_10?: string[];
    isbn_13?: string[];
  };
}

export interface OpenLibraryAuthor {
  key: string;
  name: string;
  photos?: number[];
}

export interface CoverImage {
  url: string;
  width: number;
  height: number;
}

const BASE_URL = 'https://covers.openlibrary.org/b';
const SEARCH_URL = 'https://openlibrary.org/search.json';
const BOOK_URL = 'https://openlibrary.org';

/**
 * Размеры обложек Open Library
 */
export const OpenLibraryCoverSize = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L',
} as const;

export type OpenLibraryCoverSizeType = typeof OpenLibraryCoverSize[keyof typeof OpenLibraryCoverSize];

/**
 * Построить URL обложки по ID
 */
export function buildCoverUrl(id: string | number, size: OpenLibraryCoverSizeType = 'M'): string {
  return `${BASE_URL}/id/${id}-${size}.jpg`;
}

/**
 * Построить URL обложки по ISBN
 */
export function buildCoverUrlByISBN(isbn: string, size: OpenLibraryCoverSizeType = 'M'): string {
  return `${BASE_URL}/isbn/${isbn}-${size}.jpg`;
}

/**
 * Построить URL обложки по OLID (Open Library ID)
 */
export function buildCoverUrlByOLID(olid: string, size: OpenLibraryCoverSizeType = 'M'): string {
  // OLID формата OL12345M
  return `${BASE_URL}/olid/${olid}-${size}.jpg`;
}

/**
 * Поиск книги по названию и автору
 */
export async function searchBook(
  title: string,
  author?: string,
  limit: number = 5
): Promise<OpenLibraryBook[]> {
  const params = new URLSearchParams({
    title,
    limit: limit.toString(),
  });

  if (author) {
    params.append('author', author);
  }

  try {
    const response = await fetch(`${SEARCH_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();

    interface SearchDoc {
      key: string;
      title: string;
      author_key?: string[];
      cover_i?: number;
      isbn?: string[];
      isbn_13?: string[];
    }

    return data.docs?.map((doc: SearchDoc) => ({
      key: doc.key,
      title: doc.title,
      authors: doc.author_key?.map((key: string) => ({ key })),
      covers: doc.cover_i ? [doc.cover_i] : [],
      identifiers: {
        isbn_10: doc.isbn,
        isbn_13: doc.isbn_13,
      },
    })) || [];
  } catch (error) {
    console.error('Open Library search error:', error);
    return [];
  }
}

/**
 * Получить информацию о книге по ключу
 */
export async function getBook(key: string): Promise<OpenLibraryBook | null> {
  try {
    const response = await fetch(`${BOOK_URL}${key}.json`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      key: data.key,
      title: data.title,
      authors: data.authors,
      covers: data.covers,
      identifiers: data.identifiers,
    };
  } catch (error) {
    console.error('Open Library get book error:', error);
    return null;
  }
}

/**
 * Получить обложку для книги
 * Приоритет: covers array > ISBN > поиск по названию
 */
export async function getBookCover(
  title: string,
  author?: string,
  isbn?: string,
  size: OpenLibraryCoverSizeType = 'M'
): Promise<string | null> {
  // Если есть ISBN, пробуем получить обложку по нему
  if (isbn) {
    const url = buildCoverUrlByISBN(isbn, size);
    if (await checkImageExists(url)) {
      return url;
    }
  }

  // Ищем книгу по названию и автору
  const books = await searchBook(title, author, 3);
  
  for (const book of books) {
    // Если есть обложки, возвращаем первую
    if (book.covers && book.covers.length > 0) {
      return buildCoverUrl(book.covers[0], size);
    }

    // Если есть ISBN, пробуем его
    const isbns = [
      ...(book.identifiers?.isbn_10 || []),
      ...(book.identifiers?.isbn_13 || []),
    ];
    
    for (const isbn of isbns) {
      const url = buildCoverUrlByISBN(isbn, size);
      if (await checkImageExists(url)) {
        return url;
      }
    }
  }

  return null;
}

/**
 * Проверить существование изображения
 */
async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Получить обложку автора по ключу
 */
export async function getAuthorCover(
  authorKey: string,
  size: OpenLibraryCoverSizeType = 'M'
): Promise<string | null> {
  try {
    const response = await fetch(`${BOOK_URL}${authorKey}.json`);
    
    if (!response.ok) {
      return null;
    }

    const data: OpenLibraryAuthor = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return `${BASE_URL.replace('/b/', '/a/')}/id/${data.photos[0]}-${size}.jpg`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Кэш для обложек
 */
const coverCache = new Map<string, string>();

/**
 * Получить обложку с кэшированием
 */
export async function getCachedCover(
  cacheKey: string,
  title: string,
  author?: string,
  isbn?: string,
  size: OpenLibraryCoverSizeType = 'M'
): Promise<string | null> {
  // Проверяем кэш
  if (coverCache.has(cacheKey)) {
    return coverCache.get(cacheKey)!;
  }

  const cover = await getBookCover(title, author, isbn, size);
  
  if (cover) {
    coverCache.set(cacheKey, cover);
  }

  return cover;
}

/**
 * Очистить кэш обложек
 */
export function clearCoverCache(): void {
  coverCache.clear();
}
