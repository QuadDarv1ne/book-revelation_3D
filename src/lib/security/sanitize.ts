/**
 * Утилита для защиты от XSS-атак
 * Использует DOMPurify для санитизации HTML и текста
 */

import DOMPurify from 'dompurify';

// Проверка на наличие окна (для SSR)
const isBrowser = typeof window !== 'undefined';

/**
 * Санитизация HTML-контента
 * @param dirty - Исходный HTML
 * @returns Очищенный HTML
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  
  if (isBrowser) {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'blockquote', 'cite'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'title'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    });
  }
  
  // Для SSR возвращаем очищенный текст
  return dirty.replace(/<[^>]*>/g, '');
}

/**
 * Санитизация текстового контента (удаление всех HTML-тегов)
 * @param text - Исходный текст
 * @returns Очищенный текст
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Удаляем все HTML-теги и сущности
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .trim();
}

/**
 * Экранирование специальных символов для безопасного вывода
 * @param text - Текст для экранирования
 * @returns Экранированный текст
 */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Валидация URL для безопасного использования в href
 * @param url - URL для проверки
 * @returns Безопасный URL или пустая строка
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  
  try {
    const parsedUrl = new URL(url);
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return '';
    }
    return parsedUrl.href;
  } catch {
    // Относительные URL разрешаем
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
    return '';
  }
}

/**
 * Санитизация для использования в dangerouslySetInnerHTML
 * @param dirty - Исходный HTML
 * @returns Объект для dangerouslySetInnerHTML
 */
export function createSafeHTML(dirty: string): { __html: string } {
  return { __html: sanitizeHTML(dirty) };
}
