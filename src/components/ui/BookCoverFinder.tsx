'use client';

import { useState, useCallback } from 'react';
import { useBookCover } from '@/hooks/use-book-cover';
import type { BookSearchQuery } from '@/lib/book-cover-api';

interface BookCoverFinderProps {
  currentTitle: string;
  currentAuthor: string;
  currentCover: string;
  onCoverUpdate?: (newCover: string) => void;
}

/**
 * Компонент для поиска и обновления обложки книги через API
 */
export function BookCoverFinder({
  currentTitle,
  currentAuthor,
  currentCover,
  onCoverUpdate
}: BookCoverFinderProps) {
  const [searchQuery, setSearchQuery] = useState<BookSearchQuery>({
    title: currentTitle,
    author: currentAuthor
  });
  const [useCustomQuery, setUseCustomQuery] = useState(false);
  const [customTitle, setCustomTitle] = useState(currentTitle);
  const [customAuthor, setCustomAuthor] = useState(currentAuthor);

  const { cover, loading, error, reload } = useBookCover(
    useCustomQuery 
      ? { title: customTitle, author: customAuthor }
      : searchQuery,
    { autoSearch: false }
  );

  const handleSearch = useCallback(() => {
    if (useCustomQuery) {
      setSearchQuery({ title: customTitle, author: customAuthor });
    }
    reload();
  }, [useCustomQuery, customTitle, customAuthor, reload]);

  const handleApplyCover = useCallback(() => {
    if (cover?.coverUrl && onCoverUpdate) {
      onCoverUpdate(cover.coverUrl);
    }
  }, [cover, onCoverUpdate]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Обложка книги</h3>
        <button
          onClick={() => setUseCustomQuery(!useCustomQuery)}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          {useCustomQuery ? 'Использовать оригинал' : 'Свой поиск'}
        </button>
      </div>

      {useCustomQuery && (
        <div className="space-y-2">
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Название книги"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            type="text"
            value={customAuthor}
            onChange={(e) => setCustomAuthor(e.target.value)}
            placeholder="Автор"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Поиск...' : 'Найти обложку'}
        </button>
        <button
          onClick={reload}
          disabled={loading || !cover}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Обновить
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Текущая обложка */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-center">Текущая</p>
          <img
            src={currentCover}
            alt="Current cover"
            className="w-full h-48 object-cover rounded-md shadow-md"
          />
        </div>

        {/* Найденная обложка */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-center">
            {loading ? 'Поиск...' : cover?.source === 'local' ? 'Локальная' : 'Найдена'}
          </p>
          {cover?.coverUrl ? (
            <>
              <img
                src={cover.coverUrl}
                alt={cover.title || 'Found cover'}
                className="w-full h-48 object-cover rounded-md shadow-md"
              />
              {cover.source && (
                <p className="text-xs text-center text-gray-500">
                  Источник: {cover.source}
                  {cover.publisher && ` • ${cover.publisher}`}
                  {cover.publishedDate && ` • ${cover.publishedDate}`}
                </p>
              )}
              <button
                onClick={handleApplyCover}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Применить
              </button>
            </>
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">
                {loading ? 'Загрузка...' : 'Не найдено'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Информация */}
      {cover?.title && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm font-medium">{cover.title}</p>
          {cover.author && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{cover.author}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BookCoverFinder;
