/**
 * Security utilities
 * Защита от XSS и других атак
 */

export {
  sanitizeHTML,
  sanitizeText,
  escapeHTML,
  sanitizeURL,
  createSafeHTML,
} from './sanitize';
