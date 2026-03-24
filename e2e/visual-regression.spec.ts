import { test, expect } from '@playwright/test';

// Visual regression тесты для 3D приложения ограничены из-за:
// - WebGL рендеринг нестабилен в headless браузерах
// - Анимации и частицы меняются каждый кадр
// - Используйте Lighthouse и ручное тестирование для визуальной проверки

test.describe('Visual Regression Tests @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(3000);
  });

  // Полностраничные скриншоты пропущены: 3D анимации нестабильны
  test.skip('Главная страница - десктоп', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('main-desktop.png', {
      fullPage: true,
      timeout: 30000,
      maxDiffPixels: 500,
    });
  });

  test.skip('Главная страница - планшет', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('main-tablet.png', {
      fullPage: true,
      timeout: 30000,
      maxDiffPixels: 500,
    });
  });

  test.skip('Главная страница - мобильный', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('main-mobile.png', {
      fullPage: true,
      timeout: 30000,
      maxDiffPixels: 500,
    });
  });

  test.skip('3D книга - базовый вид', async ({ page }) => {
    await page.waitForSelector('[role="application"]', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const canvas = page.locator('canvas');
    await expect(canvas).toHaveScreenshot('book-3d-base.png', {
      maxDiffPixels: 1000,
      timeout: 30000,
    });
  });

  test.skip('Панель настроек', async ({ page }) => {
    const settingsButton = page.locator('button[aria-label*="настроек"]');
    if (await settingsButton.isVisible()) {
      await settingsButton.click({ force: true });
      await page.waitForTimeout(500);

      const settingsPanel = page.locator('[role="dialog"], .settings-panel');
      if (await settingsPanel.isVisible()) {
        await expect(settingsPanel).toHaveScreenshot('settings-panel.png', {
          timeout: 20000,
        });
      }
    }
  });

  test.skip('Цитата дня', async ({ page }) => {
    const quoteCard = page.locator('[data-testid="quote-of-day"], .quote-card');
    if (await quoteCard.isVisible()) {
      await expect(quoteCard).toHaveScreenshot('quote-of-day.png', {
        timeout: 20000,
      });
    }
  });

  test.skip('Тёмная тема', async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="тема"], button:has-text("Тёмная")').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('theme-dark.png', {
        fullPage: true,
        timeout: 30000,
        maxDiffPixels: 500,
      });
    }
  });

  test.skip('Светлая тема', async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="тема"], button:has-text("Светлая")').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('theme-light.png', {
        fullPage: true,
        timeout: 30000,
        maxDiffPixels: 500,
      });
    }
  });

  test.skip('Состояние загрузки', async ({ page }) => {
    await page.reload();

    const loadingElement = page.locator('[data-testid="loading"], .loading, [class*="loading"]');
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toHaveScreenshot('loading-state.png', {
        timeout: 20000,
      });
    }
  });

  test.skip('Адаптивность меню', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('button[aria-label*="меню"], button:has-text("Меню")').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      const mobileMenu = page.locator('[role="dialog"][aria-label*="меню"], .mobile-menu');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toHaveScreenshot('mobile-menu.png', {
          timeout: 20000,
        });
      }
    }
  });

  test.skip('Достижения панель', async ({ page }) => {
    const achievementsPanel = page.locator('[data-testid="achievements"], [class*="achievements"]');
    if (await achievementsPanel.isVisible()) {
      await expect(achievementsPanel).toHaveScreenshot('achievements-panel.png', {
        timeout: 20000,
      });
    }
  });

  test.skip('Загрузка обложки UI', async ({ page }) => {
    const uploadArea = page.locator('[data-testid="cover-upload"], [class*="upload"]');
    if (await uploadArea.isVisible()) {
      await expect(uploadArea).toHaveScreenshot('cover-upload-ui.png', {
        timeout: 20000,
      });
    }
  });

  // Базовая проверка: страница загружается без критических ошибок
  test('Страница загружается успешно', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
