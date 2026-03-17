"use client";

import { useState } from 'react';
import { useBookCover } from '@/hooks/use-book-cover';
import type { Book } from '@/data/books';

interface BookCoverProps {
  book: Book;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function BookCover({
  book,
  size = 'medium',
  className = '',
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);
  
  const { coverUrl, isLoading } = useBookCover(
    book.title,
    book.author,
    book.isbn,
    {
      size: size === 'small' ? 'S' : size === 'large' ? 'L' : 'M',
      enabled: !imageError,
      fallbackUrl: book.coverImage.startsWith('/') ? undefined : book.coverImage,
    }
  );

  // Определяем размеры в зависимости от size
  const sizeClasses = {
    small: 'w-20 h-28',
    medium: 'w-32 h-44',
    large: 'w-48 h-64',
  };

  // Локальное изображение (fallback)
  const localCoverUrl = book.coverImage;

  // Финальный URL: Open Library cover -> локальное изображение
  const finalUrl = imageError ? localCoverUrl : (coverUrl || localCoverUrl);

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Загрузочный скелетон */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-amber-900/20 to-amber-700/20 rounded-lg border border-amber-500/20" />
      )}

      {/* Изображение обложки */}
      <img
        src={finalUrl}
        alt={`Обложка книги: ${book.title} — ${book.author}`}
        className={`
          w-full h-full object-cover rounded-lg shadow-lg
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        loading="lazy"
        onError={() => {
          if (!imageError) {
            setImageError(true);
          }
        }}
        width={size === 'small' ? 80 : size === 'large' ? 192 : 128}
        height={size === 'small' ? 112 : size === 'large' ? 256 : 176}
      />

      {/* Индикатор Open Library для отладки */}
      {process.env.NODE_ENV === 'development' && coverUrl && coverUrl !== localCoverUrl && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[8px] bg-green-500/80 text-white rounded">
          OL
        </div>
      )}
    </div>
  );
}

/**
 * Компонент галереи обложек для нескольких книг
 */
interface BookCoverGalleryProps {
  books: Book[];
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function BookCoverGallery({
  books,
  size = 'medium',
  className = '',
}: BookCoverGalleryProps) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {books.map((book) => (
        <BookCover key={book.id} book={book} size={size} />
      ))}
    </div>
  );
}
