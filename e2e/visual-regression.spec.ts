import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Главная страница - десктоп', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('main-desktop.png', {
      fullPage: true,
    });
  });

  test('Главная страница - планшет', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('main-tablet.png', {
      fullPage: true,
    });
  });

  test('Главная страница - мобильный', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('main-mobile.png', {
      fullPage: true,
    });
  });

  test('3D книга - базовый вид', async ({ page }) => {
    await page.waitForSelector('[role="application"]', { timeout: 10000 });
    
    // Ждем загрузки 3D сцены
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveScreenshot('book-3d-base.png', {
      maxDiffPixels: 100,
    });
  });

  test('Панель настроек', async ({ page }) => {
    // Открываем панель настроек
    const settingsButton = page.locator('button[aria-label="Настройки"], button:has-text("Настройки")');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      
      const settingsPanel = page.locator('[role="dialog"], .settings-panel');
      if (await settingsPanel.isVisible()) {
        await expect(settingsPanel).toHaveScreenshot('settings-panel.png');
      }
    }
  });

  test('Цитата дня', async ({ page }) => {
    const quoteCard = page.locator('[data-testid="quote-of-day"], .quote-card');
    if (await quoteCard.isVisible()) {
      await expect(quoteCard).toHaveScreenshot('quote-of-day.png');
    }
  });

  test('Тёмная тема', async ({ page }) => {
    // Переключаем на тёмную тему
    const themeButton = page.locator('button[aria-label*="тема"], button:has-text("Тёмная")').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('theme-dark.png', {
        fullPage: true,
      });
    }
  });

  test('Светлая тема', async ({ page }) => {
    // Переключаем на светлую тему
    const themeButton = page.locator('button[aria-label*="тема"], button:has-text("Светлая")').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('theme-light.png', {
        fullPage: true,
      });
    }
  });

  test('Состояние загрузки', async ({ page }) => {
    // Перезагружаем страницу для теста загрузки
    await page.reload();
    
    // Ловим состояние загрузки
    const loadingElement = page.locator('[data-testid="loading"], .loading, [class*="loading"]');
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toHaveScreenshot('loading-state.png');
    }
  });

  test('Адаптивность меню', async ({ page }) => {
    // Тестируем мобильное меню
    await page.setViewportSize({ width: 375, height: 667 });
    
    const menuButton = page.locator('button[aria-label*="меню"], button:has-text("Меню")').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
      
      const mobileMenu = page.locator('[role="dialog"][aria-label*="меню"], .mobile-menu');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toHaveScreenshot('mobile-menu.png');
      }
    }
  });

  test('Достижения панель', async ({ page }) => {
    const achievementsPanel = page.locator('[data-testid="achievements"], [class*="achievements"]');
    if (await achievementsPanel.isVisible()) {
      await expect(achievementsPanel).toHaveScreenshot('achievements-panel.png');
    }
  });

  test('Загрузка обложки UI', async ({ page }) => {
    const uploadArea = page.locator('[data-testid="cover-upload"], [class*="upload"]');
    if (await uploadArea.isVisible()) {
      await expect(uploadArea).toHaveScreenshot('cover-upload-ui.png');
    }
  });
});
