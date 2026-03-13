/**
 * Google Books API Client
 * 
 * Резервный источник для получения обложек книг
 * Документация: https://developers.google.com/books/docs/v1/using
 * 
 * Rate limits: Зависит от квот проекта Google Cloud
 */

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    language?: string;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    infoLink?: string;
    canonicalVolumeLink?: string;
  };
  saleInfo?: {
    country: string;
    saleability: string;
    isEbook: boolean;
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
  };
  accessInfo?: {
    country: string;
    viewability: string;
    embeddable: boolean;
    publicDomain: boolean;
    epub?: {
      isAvailable: boolean;
    };
    pdf?: {
      isAvailable: boolean;
    };
  };
}

export interface GoogleBooksSearchResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}

const BASE_URL = 'https://www.googleapis.com/books/v1';

/**
 * Размеры обложек
 */
export const CoverSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type CoverSize = typeof CoverSize[keyof typeof CoverSize];

/**
 * Построить URL обложки из Google Books
 */
export function buildCoverUrl(volumeId: string, size: CoverSize = 'medium'): string {
  const zoomLevels: Record<CoverSize, number> = {
    small: 2,
    medium: 3,
    large: 4,
  };

  return `https://books.google.com/books?id=${volumeId}&printsec=frontcover&img=1&zoom=${zoomLevels[size]}&source=gbs_api`;
}

/**
 * Поиск книг по названию и автору
 */
export async function searchBook(
  title: string,
  author?: string,
  isbn?: string,
  limit: number = 5
): Promise<GoogleBooksVolume[]> {
  const queryParams: string[] = [];

  // Формируем поисковый запрос
  if (isbn) {
    queryParams.push(`isbn:${isbn}`);
  } else {
    let query = `intitle:${encodeURIComponent(title)}`;
    if (author) {
      query += `+inauthor:${encodeURIComponent(author)}`;
    }
    queryParams.push(`q=${query}`);
  }

  queryParams.push(`maxResults=${limit}`);
  queryParams.push('projection=lite'); // Уменьшаем размер ответа

  const url = `${BASE_URL}/volumes?${queryParams.join('&')}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksSearchResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Google Books search error:', error);
    return [];
  }
}

/**
 * Получить информацию о книге по ID
 */
export async function getVolume(volumeId: string): Promise<GoogleBooksVolume | null> {
  try {
    const response = await fetch(`${BASE_URL}/volumes/${volumeId}?projection=lite`);
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Google Books get volume error:', error);
    return null;
  }
}

/**
 * Получить обложку для книги
 * Приоритет: ISBN > поиск по названию
 */
export async function getBookCover(
  title: string,
  author?: string,
  isbn?: string,
  size: CoverSize = 'medium'
): Promise<string | null> {
  // Ищем книгу
  const volumes = await searchBook(title, author, isbn, 3);
  
  for (const volume of volumes) {
    // Проверяем точность совпадения
    const volumeTitle = volume.volumeInfo.title.toLowerCase();
    const searchTitle = title.toLowerCase();
    
    // Если название совпадает или содержит искомое
    if (volumeTitle.includes(searchTitle) || searchTitle.includes(volumeTitle)) {
      const imageLinks = volume.volumeInfo.imageLinks;
      
      if (imageLinks) {
        // Возвращаем подходящий размер
        const sizeMap: Record<CoverSize, keyof typeof imageLinks> = {
          small: 'small',
          medium: 'medium',
          large: 'large',
        };
        
        const coverUrl = imageLinks[sizeMap[size]] || imageLinks.thumbnail;
        if (coverUrl) {
          return coverUrl;
        }
      }

      // Если нет imageLinks, строим URL из volumeId
      return buildCoverUrl(volume.id, size);
    }
  }

  return null;
}

/**
 * Получить расширенную информацию о книге
 */
export async function getBookDetails(
  title: string,
  author?: string,
  isbn?: string
): Promise<GoogleBooksVolume | null> {
  const volumes = await searchBook(title, author, isbn, 1);
  
  if (volumes.length > 0) {
    return getVolume(volumes[0].id);
  }

  return null;
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
  size: CoverSize = 'medium'
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

/**
 * Извлечь ISBN из volume info
 */
export function extractISBN(volume: GoogleBooksVolume): { isbn10?: string; isbn13?: string } {
  const identifiers = volume.volumeInfo.industryIdentifiers || [];
  
  const isbn10 = identifiers.find(id => id.type === 'ISBN_10')?.identifier;
  const isbn13 = identifiers.find(id => id.type === 'ISBN_13')?.identifier;
  
  return { isbn10, isbn13 };
}
