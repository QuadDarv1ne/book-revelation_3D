"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { books } from "@/data/books";
import { useToast } from "@/components/ui/Toast";

interface BookSelectorProps {
  activeBookId: string;
  onBookChange: (bookId: string) => void;
}

export function BookSelector({ activeBookId, onBookChange }: BookSelectorProps) {
  const activeBook = books.find(b => b.id === activeBookId) || books[0];
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Управление клавиатурой
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          const selectedBook = books[focusedIndex];
          if (selectedBook) {
            onBookChange(selectedBook.id);
            showToast(`Книга изменена на: ${selectedBook.title}`, "success");
            setIsOpen(false);
            buttonRef.current?.focus();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex(prev => (prev + 1) % books.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex(prev => (prev - 1 + books.length) % books.length);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [isOpen, focusedIndex, onBookChange, showToast]);

  // Фокус на выбранном элементе
  useEffect(() => {
    if (!isOpen) return;
    
    const selectedIndex = books.findIndex(b => b.id === activeBookId);
    setFocusedIndex(prev => selectedIndex >= 0 ? selectedIndex : prev);
  }, [isOpen, activeBookId]);

  const handleBookSelect = useCallback((bookId: string, title: string) => {
    onBookChange(bookId);
    showToast(`Книга изменена на: ${title}`, "success");
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [onBookChange, showToast]);

  return (
    <div className="absolute top-3 right-3 z-40" ref={dropdownRef}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl bg-[rgba(15,15,25,0.9)] border border-[rgba(212,175,55,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Иконка книги */}
        <svg className="w-4 h-4 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>

        {/* Выпадающий список книг */}
        <div className="relative group">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className="flex items-center gap-2 text-sm text-amber-100 hover:text-amber-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[rgba(15,15,25,0.9)] rounded-lg px-2 py-1"
            aria-label="Выбрать книгу"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls="book-listbox"
            type="button"
          >
            <span className="font-medium">{activeBook.title}</span>
            <span className="text-amber-400/50">—</span>
            <span className="text-amber-300/80 text-xs">{activeBook.author}</span>
            <svg className="w-3 h-3 text-amber-400/60 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Выпадающее меню */}
          <div
            id="book-listbox"
            className={`absolute right-0 top-full mt-2 min-w-[280px] rounded-xl overflow-hidden backdrop-blur-xl bg-[rgba(15,15,25,0.98)] border border-[rgba(212,175,55,0.3)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] transition-all duration-200 transform origin-top-right ${
              isOpen 
                ? "opacity-100 visible scale-100" 
                : "opacity-0 invisible scale-95"
            }`}
            role="listbox"
            aria-label="Список книг"
            tabIndex={-1}
          >
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar" role="list">
              {books.map((book, index) => {
                const isActive = book.id === activeBookId;
                const isFocused = index === focusedIndex;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookSelect(book.id, book.title)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors focus:outline-none ${
                      isActive
                        ? "bg-[rgba(212,175,55,0.2)] border-l-4 border-amber-400"
                        : isFocused
                          ? "bg-[rgba(212,175,55,0.1)] border-l-4 border-amber-400/50"
                          : "border-l-4 border-transparent hover:bg-[rgba(212,175,55,0.08)]"
                    }`}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    type="button"
                  >
                    {/* Цветной индикатор */}
                    <div
                      className="w-1 h-8 rounded-full mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: book.color }}
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? "text-amber-100" : "text-gray-200"}`}>
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{book.description}</p>
                    </div>
                    {isActive && (
                      <svg className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
