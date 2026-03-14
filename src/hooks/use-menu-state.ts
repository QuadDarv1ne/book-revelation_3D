"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseMenuStateOptions {
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

export function useMenuState(options: UseMenuStateOptions = {}) {
  const { closeOnEscape = true, closeOnOutsideClick = true } = options;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close, closeOnOutsideClick]);

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [close, closeOnEscape, isOpen]);

  return {
    isOpen,
    setIsOpen,
    toggle,
    open,
    close,
    menuRef,
  };
}
