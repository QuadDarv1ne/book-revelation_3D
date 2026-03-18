"use client";

import { useMemo } from "react";
import { books } from "@/data/books";
import { useUserSettings } from "@/hooks/use-user-settings";

interface BookProgress {
  id: string;
  title: string;
  author: string;
  read: number;
  total: number;
  percentage: number;
  color: string;
}

/**
 * Компонент отображения прогресса чтения книг
 */
export function BookProgressTracker() {
  const { getBookProgress } = useUserSettings();

  const progressData: BookProgress[] = useMemo(() => {
    return books.map((book) => {
      const progress = getBookProgress(book.id, book.quotes.length);
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        ...progress,
        color: book.color,
      };
    });
  }, [getBookProgress]);

  const totalRead = useMemo(
    () => progressData.reduce((sum, book) => sum + book.read, 0),
    [progressData]
  );

  const totalQuotes = useMemo(
    () => progressData.reduce((sum, book) => sum + book.total, 0),
    [progressData]
  );

  const overallPercentage = useMemo(
    () => (totalQuotes > 0 ? Math.round((totalRead / totalQuotes) * 100) : 0),
    [totalRead, totalQuotes]
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Прогресс чтения
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Прочитано цитат: {totalRead} из {totalQuotes}</span>
          <span className="text-primary font-medium">({overallPercentage}%)</span>
        </div>
        {/* Общий прогресс-бар */}
        <div className="mt-2 h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
            role="progressbar"
            aria-valuenow={overallPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Общий прогресс чтения"
          />
        </div>
      </div>

      {/* Прогресс по каждой книге */}
      <div className="space-y-4">
        {progressData.map((book) => (
          <div key={book.id} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">{book.title}</span>
                <span className="text-muted-foreground ml-2">— {book.author}</span>
              </div>
              <span className="text-muted-foreground">
                {book.read} / {book.total}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${book.percentage}%`,
                  backgroundColor: book.color 
                }}
                role="progressbar"
                aria-valuenow={book.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Прогресс чтения книги ${book.title}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Сообщение о завершении */}
      {overallPercentage === 100 && (
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
          <p className="text-primary font-semibold">
            🎉 Поздравляем! Все цитаты прочитаны!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Вы настоящий ценитель стоической мудрости
          </p>
        </div>
      )}
    </div>
  );
}
