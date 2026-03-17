import {renderHook, act} from '@testing-library/react';
import {useI18n, type Locale} from './use-i18n';

describe('useI18n', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('должен возвращать локаль по умолчанию (ru)', () => {
    const {result} = renderHook(() => useI18n());

    expect(result.current.locale).toBe('ru');
  });

  it('должен загружать сохранённую локаль из localStorage', () => {
    localStorage.setItem('locale', 'en');

    const {result} = renderHook(() => useI18n());

    expect(result.current.locale).toBe('en');
  });

  it('должен менять локаль через setLocale', () => {
    const {result} = renderHook(() => useI18n());

    act(() => {
      result.current.setLocale('zh');
    });

    expect(result.current.locale).toBe('zh');
    expect(localStorage.getItem('locale')).toBe('zh');
  });

  it('должен переводить ключи для en локали', () => {
    localStorage.setItem('locale', 'en');

    const {result} = renderHook(() => useI18n());

    expect(result.current.t('quotes.search')).toBe('Search quotes...');
    expect(result.current.t('theme.dark')).toBe('Dark');
  });

  it('должен переводить ключи для ru локали', () => {
    localStorage.setItem('locale', 'ru');

    const {result} = renderHook(() => useI18n());

    expect(result.current.t('quotes.search')).toBe('Поиск цитат...');
    expect(result.current.t('theme.dark')).toBe('Тёмная');
  });

  it('должен переводить ключи для zh локали', () => {
    localStorage.setItem('locale', 'zh');

    const {result} = renderHook(() => useI18n());

    expect(result.current.t('quotes.search')).toBe('搜索名言...');
    expect(result.current.t('theme.dark')).toBe('深色');
  });

  it('должен возвращать RTL направление для he локали', () => {
    localStorage.setItem('locale', 'he');

    const {result} = renderHook(() => useI18n());

    expect(result.current.dir).toBe('rtl');
  });

  it('должен возвращать LTR направление для остальных локалей', () => {
    const locales: Locale[] = ['en', 'ru', 'zh', 'es', 'fr'];

    locales.forEach(locale => {
      localStorage.setItem('locale', locale);
      const {result} = renderHook(() => useI18n());
      expect(result.current.dir).toBe('ltr');
    });
  });

  it('должен возвращать ключ, если перевод не найден', () => {
    localStorage.setItem('locale', 'en');

    const {result} = renderHook(() => useI18n());

    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('должен сохранять локаль в localStorage при смене', () => {
    const {result} = renderHook(() => useI18n());

    act(() => {
      result.current.setLocale('fr');
    });

    expect(localStorage.getItem('locale')).toBe('fr');

    act(() => {
      result.current.setLocale('es');
    });

    expect(localStorage.getItem('locale')).toBe('es');
  });

  it('должен поддерживать все 6 локалей', () => {
    const locales: Locale[] = ['en', 'ru', 'zh', 'he', 'es', 'fr'];

    locales.forEach(locale => {
      const {result} = renderHook(() => useI18n());

      act(() => {
        result.current.setLocale(locale);
      });

      expect(result.current.locale).toBe(locale);
    });
  });
});
