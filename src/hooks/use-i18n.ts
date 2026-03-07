"use client";

import {useState, useCallback, useEffect} from 'react';

export type Locale = 'en' | 'ru' | 'zh' | 'he';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'quotes.search': 'Search quotes...',
    'quotes.all': 'All',
    'quotes.favorites': 'Favorites',
    'quotes.shuffle': 'Shuffle',
    'quotes.export': 'Export',
    'quotes.import': 'Import',
    'quotes.copy': 'Copy',
    'quotes.share': 'Share',
    'quotes.filters': 'Quote filters',
    'quotes.noFavorites': 'No favorite quotes yet. Click the heart to add one.',
    'quotes.loading': 'Loading quotes from "{book}"...',
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'theme.blue': 'Blue',
    'theme.purple': 'Purple',
    'theme.ambient': 'Ambient',
    'theme.relax': 'Relax',
    'theme.auto': 'Auto',
    'toast.noFavoritesToExport': 'No favorites to export',
    'toast.favoritesExported': 'Favorites exported',
    'toast.exportError': 'Export error',
    'toast.favoritesImported': 'Imported {count} quotes',
    'toast.importError': 'Import error',
    'toast.readFileError': 'File read error',
    'menu.favorites': 'Favorites',
  },
  ru: {
    'quotes.search': 'Поиск цитат...',
    'quotes.all': 'Все',
    'quotes.favorites': 'Избранные',
    'quotes.shuffle': 'Перемешать',
    'quotes.export': 'Экспорт',
    'quotes.import': 'Импорт',
    'quotes.copy': 'Копировать',
    'quotes.share': 'Поделиться',
    'quotes.filters': 'Фильтры цитат',
    'quotes.noFavorites': 'Нет избранных цитат. Нажмите на сердце, чтобы добавить.',
    'quotes.loading': 'Загрузка цитат из книги "{book}"...',
    'theme.dark': 'Тёмная',
    'theme.light': 'Светлая',
    'theme.blue': 'Синяя',
    'theme.purple': 'Фиолетовая',
    'theme.ambient': 'Амбиент',
    'theme.relax': 'Релакс',
    'theme.auto': 'Авто',
    'toast.noFavoritesToExport': 'Нет избранных для экспорта',
    'toast.favoritesExported': 'Избранное экспортировано',
    'toast.exportError': 'Ошибка экспорта',
    'toast.favoritesImported': 'Импортировано {count} цитат',
    'toast.importError': 'Ошибка импорта',
    'toast.readFileError': 'Ошибка чтения файла',
    'menu.favorites': 'Избранное',
  },
  zh: {
    'quotes.search': '搜索名言...',
    'quotes.all': '全部',
    'quotes.favorites': '收藏',
    'quotes.shuffle': '随机',
    'quotes.export': '导出',
    'quotes.import': '导入',
    'quotes.copy': '复制',
    'quotes.share': '分享',
    'quotes.filters': '名言筛选',
    'quotes.noFavorites': '还没有收藏的名言。点击心形图标添加。',
    'quotes.loading': '正在从"{book}"加载名言...',
    'theme.dark': '深色',
    'theme.light': '浅色',
    'theme.blue': '蓝色',
    'theme.purple': '紫色',
    'theme.ambient': '环境',
    'theme.relax': '放松',
    'theme.auto': '自动',
    'toast.noFavoritesToExport': '没有可导出的收藏',
    'toast.favoritesExported': '收藏已导出',
    'toast.exportError': '导出错误',
    'toast.favoritesImported': '已导入 {count} 条名言',
    'toast.importError': '导入错误',
    'toast.readFileError': '文件读取错误',
    'menu.favorites': '收藏',
  },
  he: {
    'quotes.search': 'חיפוש ציטוטים...',
    'quotes.all': 'הכל',
    'quotes.favorites': 'מועדפים',
    'quotes.shuffle': 'ערבוב',
    'quotes.export': 'ייצוא',
    'quotes.import': 'ייבוא',
    'quotes.copy': 'העתק',
    'quotes.share': 'שתף',
    'quotes.filters': 'סינון ציטוטים',
    'quotes.noFavorites': 'אין ציטוטים מועדפים עדיין. לחץ על הלב להוספה.',
    'quotes.loading': 'טוען ציטוטים מ-"{book}"...',
    'theme.dark': 'כהה',
    'theme.light': 'בהיר',
    'theme.blue': 'כחול',
    'theme.purple': 'סגול',
    'theme.ambient': 'אמביינט',
    'theme.relax': 'רגוע',
    'theme.auto': 'אוטומטי',
    'toast.noFavoritesToExport': 'אין מועדפים לייצוא',
    'toast.favoritesExported': 'המועדפים יוצאו',
    'toast.exportError': 'שגיאת ייצוא',
    'toast.favoritesImported': 'יובאו {count} ציטוטים',
    'toast.importError': 'שגיאת ייבוא',
    'toast.readFileError': 'שגיאת קריאת קובץ',
    'menu.favorites': 'מועדפים',
  },
};

export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && ['en', 'ru', 'zh', 'he'].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string) => {
    return translations[locale]?.[key] || key;
  }, [locale]);

  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return {locale, setLocale, t, dir};
}
