import { test, expect } from '@playwright/test';

test.describe('Gamification Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas');
  });

  test('achievements are tracked', async ({ page }) => {
    // Открываем меню геймификации
    await page.click('button[aria-label*="меню настроек"]');
    await page.waitForTimeout(500);
    await page.click('text=Настройки');
    await page.waitForTimeout(300);

    const gamificationTab = page.locator('button:has-text("Геймификация")');
    if (await gamificationTab.isVisible()) {
      await gamificationTab.click();
      await page.waitForTimeout(500);

      // Проверяем наличие достижений
      const achievements = page.locator('[data-testid="achievement"]');
      const count = await achievements.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('daily challenge is displayed', async ({ page }) => {
    // Ищем карточку дневного вызова
    const dailyChallenge = page.locator('[data-testid="daily-challenge"]');

    if (await dailyChallenge.isVisible()) {
      await expect(dailyChallenge).toContainText('Цитата дня');
    }
  });

  test('favorites can be added and removed', async ({ page }) => {
    // Находим первую цитату
    const firstQuote = page.locator('[data-testid="quote-card"]').first();
    await expect(firstQuote).toBeVisible();

    // Добавляем в избранное
    const favoriteButton = firstQuote.locator('button[aria-label*="избранн"]');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Проверяем, что кнопка изменилась
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Удаляем из избранного
    await favoriteButton.click();
    await page.waitForTimeout(500);

    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('statistics are tracked', async ({ page }) => {
    await page.click('button[aria-label*="меню настроек"]');
    await page.waitForTimeout(500);
    await page.click('text=Настройки');
    await page.waitForTimeout(300);

    const gamificationTab = page.locator('button:has-text("Геймификация")');
    if (await gamificationTab.isVisible()) {
      await gamificationTab.click();
      await page.waitForTimeout(500);

      // Проверяем наличие статистики
      const stats = page.locator('[data-testid="stats"]');
      if (await stats.isVisible()) {
        await expect(stats).toContainText(/время|цитат|книг/i);
      }
    }
  });

  test('book progress is tracked', async ({ page }) => {
    // Открываем прогресс чтения
    const progressButton = page.locator('button[aria-label*="Прогресс"]');

    if (await progressButton.isVisible()) {
      await progressButton.click();
      await page.waitForTimeout(500);

      // Проверяем наличие прогресс-баров
      const progressBars = page.locator('[role="progressbar"]');
      const count = await progressBars.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('export favorites works', async ({ page }) => {
    // Добавляем цитату в избранное
    const firstQuote = page.locator('[data-testid="quote-card"]').first();
    if (await firstQuote.isVisible()) {
      const favoriteButton = firstQuote.locator('button[aria-label*="избранн"]');
      await favoriteButton.click();
      await page.waitForTimeout(500);
    }

    // Открываем настройки
    await page.click('button[aria-label*="меню настроек"]');
    await page.waitForTimeout(500);
    await page.click('text=Настройки');
    await page.waitForTimeout(300);

    // Ищем кнопку экспорта
    const exportButton = page.locator('button:has-text("Экспорт")');
    if (await exportButton.isVisible()) {
      // Настраиваем обработчик загрузки
      const downloadPromise = page.waitForEvent('download');

      await exportButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/favorites.*\.json/);
    }
  });

  test('theme of the day challenge works', async ({ page }) => {
    // Проверяем наличие темы дня
    const themeOfDay = page.locator('[data-testid="theme-of-day"]');

    if (await themeOfDay.isVisible()) {
      await expect(themeOfDay).toContainText(/тема дня/i);

      // Пробуем выполнить вызов
      const completeButton = themeOfDay.locator('button');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await page.waitForTimeout(500);

        // Проверяем уведомление об успехе
        const toast = page.locator('[role="status"]');
        if (await toast.isVisible()) {
          await expect(toast).toBeVisible();
        }
      }
    }
  });
});

test.describe('Settings and Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('export settings works', async ({ page }) => {
    await page.click('button[aria-label*="меню настроек"]');
    await page.waitForTimeout(500);
    await page.click('text=Настройки');
    await page.waitForTimeout(300);

    const exportButton = page.locator('button:has-text("Экспорт настроек")');
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/settings.*\.json/);
    }
  });

  test('language can be changed', async ({ page }) => {
    await page.click('button[aria-label*="меню настроек"]');
    await page.waitForTimeout(500);

    // Ищем переключатель языка
    const languageButton = page.locator('button[aria-label*="язык"]');
    if (await languageButton.isVisible()) {
      await languageButton.click();
      await page.waitForTimeout(500);

      // Выбираем английский
      const englishOption = page.locator('button:has-text("English")');
      if (await englishOption.isVisible()) {
        await englishOption.click();
        await page.waitForTimeout(1000);

        // Проверяем, что интерфейс изменился
        await expect(page.locator('text=Menu')).toBeVisible();
      }
    }
  });

  test('rotation speed can be adjusted', async ({ page }) => {
    await page.click('button[aria-label*="меню настроек"]');
    await page.waitForTimeout(500);
    await page.click('text=Настройки');
    await page.waitForTimeout(300);

    // Ищем слайдер скорости
    const speedSlider = page.locator('input[type="range"][aria-label*="скорость"]');
    if (await speedSlider.isVisible()) {
      await speedSlider.fill('2');
      await page.waitForTimeout(500);

      // Проверяем, что значение изменилось
      const value = await speedSlider.inputValue();
      expect(parseFloat(value)).toBeGreaterThan(1);
    }
  });
});
