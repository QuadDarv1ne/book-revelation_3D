"use client";

import { useCallback, useEffect } from "react";
import { getShortcutsHelp } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = getShortcutsHelp();

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-[rgba(10,10,20,0.95)] border border-amber-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-xl font-bold text-amber-100">
            Горячие клавиши
          </h2>
          <button
            onClick={onClose}
            className="text-amber-400/70 hover:text-amber-300 transition-colors p-2"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5 px-3 bg-amber-900/10 hover:bg-amber-900/20 transition-colors rounded-lg"
                  >
                    <span className="text-sm text-amber-100/70">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2.5 py-1 text-xs font-mono font-medium text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-amber-500/20">
          <p className="text-xs text-amber-200/40 text-center">
            Нажмите <kbd className="px-1.5 py-0.5 text-xs bg-amber-500/20 border border-amber-500/30 rounded">Esc</kbd> для закрытия
          </p>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsHelp;
