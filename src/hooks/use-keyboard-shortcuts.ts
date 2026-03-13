'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'control' | 'view' | 'general';
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  ignoreInputFields?: boolean;
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: ' ',
    action: () => {},
    description: 'Пауза/запуск вращения',
    category: 'control'
  },
  {
    key: 'Enter',
    action: () => {},
    description: 'Пауза/запуск вращения',
    category: 'control'
  },
  {
    key: '+',
    action: () => {},
    description: 'Увеличить масштаб',
    category: 'view'
  },
  {
    key: '=',
    action: () => {},
    description: 'Увеличить масштаб',
    category: 'view'
  },
  {
    key: '-',
    action: () => {},
    description: 'Уменьшить масштаб',
    category: 'view'
  },
  {
    key: '0',
    action: () => {},
    description: 'Сбросить масштаб',
    category: 'view'
  },
  {
    key: 'ArrowLeft',
    action: () => {},
    description: 'Вращение влево',
    category: 'navigation'
  },
  {
    key: 'ArrowRight',
    action: () => {},
    description: 'Вращение вправо',
    category: 'navigation'
  },
  {
    key: 'ArrowUp',
    action: () => {},
    description: 'Вращение вверх',
    category: 'navigation'
  },
  {
    key: 'ArrowDown',
    action: () => {},
    description: 'Вращение вниз',
    category: 'navigation'
  },
  {
    key: 'r',
    action: () => {},
    description: 'Перезагрузить сцену',
    category: 'general'
  },
  {
    key: 'h',
    action: () => {},
    description: 'Показать горячие клавиши',
    category: 'general'
  },
  {
    key: 'f',
    action: () => {},
    description: 'Полноэкранный режим',
    category: 'view'
  },
  {
    key: 'c',
    action: () => {},
    description: 'Копировать цитату',
    category: 'general'
  }
];

/**
 * Хук для управления горячими клавишами
 */
export function useKeyboardShortcuts(
  shortcuts: Partial<KeyboardShortcut>[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, ignoreInputFields = true } = options;
  const shortcutsRef = useRef<KeyboardShortcut[]>([...DEFAULT_SHORTCUTS, ...shortcuts] as KeyboardShortcut[]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;

    // Игнорируем ввод в полях
    if (
      ignoreInputFields &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    // Нормализация клавиши
    const eventKey = event.key.toLowerCase();
    const eventCtrl = event.ctrlKey || event.metaKey;

    for (const shortcut of shortcutsRef.current) {
      const shortcutKey = shortcut.key.toLowerCase();

      // Проверка соответствия клавиши и модификаторов
      if (
        eventKey === shortcutKey &&
        (shortcut.ctrlKey === undefined || eventCtrl === shortcut.ctrlKey) &&
        (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
        (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
        (shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey)
      ) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [enabled, ignoreInputFields]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Обновление действий для дефолтных шорткатов
  const updateShortcutAction = useCallback((key: string, action: () => void) => {
    const shortcut = shortcutsRef.current.find(s => s.key.toLowerCase() === key.toLowerCase());
    if (shortcut) {
      shortcut.action = action;
    }
  }, []);

  return {
    updateShortcutAction,
    shortcuts: shortcutsRef.current
  };
}

/**
 * Компонент для отображения списка горячих клавиш
 */
export function getShortcutsHelp(): { category: string; shortcuts: { key: string; description: string }[] }[] {
  const categories = {
    navigation: 'Навигация',
    control: 'Управление',
    view: 'Вид',
    general: 'Общие'
  };

  const grouped = DEFAULT_SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push({
      key: shortcut.key === ' ' ? 'Пробел' : shortcut.key,
      description: shortcut.description
    });
    return acc;
  }, {} as Record<string, { key: string; description: string }[]>);

  return Object.entries(grouped).map(([category, shortcuts]) => ({
    category: categories[category as keyof typeof categories] || category,
    shortcuts
  }));
}

/**
 * Хук для отображения/скрытия подсказки по горячим клавишам
 */
export function useKeyboardShortcutsHelp() {
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

  const hideHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  return {
    showHelp,
    toggleHelp,
    hideHelp,
    shortcuts: getShortcutsHelp()
  };
}
