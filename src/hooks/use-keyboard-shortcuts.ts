export interface Shortcut {
  key: string;
  description: string;
  category: 'navigation' | 'control' | 'view' | 'general';
}

const SHORTCUTS: Shortcut[] = [
  { key: ' ', description: 'Пауза/запуск вращения', category: 'control' },
  { key: 'Enter', description: 'Пауза/запуск вращения', category: 'control' },
  { key: '+', description: 'Увеличить масштаб', category: 'view' },
  { key: '=', description: 'Увеличить масштаб', category: 'view' },
  { key: '-', description: 'Уменьшить масштаб', category: 'view' },
  { key: '0', description: 'Сбросить масштаб', category: 'view' },
  { key: 'ArrowLeft', description: 'Вращение влево', category: 'navigation' },
  { key: 'ArrowRight', description: 'Вращение вправо', category: 'navigation' },
  { key: 'ArrowUp', description: 'Вращение вверх', category: 'navigation' },
  { key: 'ArrowDown', description: 'Вращение вниз', category: 'navigation' },
  { key: 'r', description: 'Перезагрузить сцену', category: 'general' },
  { key: 'h', description: 'Показать горячие клавиши', category: 'general' },
  { key: 'f', description: 'Полноэкранный режим', category: 'view' },
  { key: 'c', description: 'Копировать цитату', category: 'general' },
];

export function getShortcutsHelp(): { category: string; shortcuts: { key: string; description: string }[] }[] {
  const categories = {
    navigation: 'Навигация',
    control: 'Управление',
    view: 'Вид',
    general: 'Общие',
  };

  const grouped = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push({
      key: shortcut.key === ' ' ? 'Пробел' : shortcut.key,
      description: shortcut.description,
    });
    return acc;
  }, {} as Record<string, { key: string; description: string }[]>);

  return Object.entries(grouped).map(([category, shortcuts]) => ({
    category: categories[category as keyof typeof categories] || category,
    shortcuts,
  }));
}
