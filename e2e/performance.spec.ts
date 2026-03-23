import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Проверяем, что страница загрузилась за разумное время
    expect(loadTime).toBeLessThan(5000); // 5 секунд
  });

  test('3D canvas renders within acceptable time', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    await page.waitForSelector('canvas', { timeout: 10000 });
    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(3000); // 3 секунды
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Фильтруем известные безопасные ошибки
    const criticalErrors = errors.filter(
      (error) => !error.includes('favicon') && !error.includes('DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('images are optimized (WebP format)', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Проверяем, что обложки книг используют WebP
    const images = await page.locator('img[src*="book-covers"]').all();

    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && !src.includes('.svg')) {
        expect(src).toMatch(/\.webp$/);
      }
    }
  });

  test('bundle size is reasonable', async ({ page }) => {
    const resources: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.js') || url.includes('.css')) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          resources.push({
            url,
            size: buffer.length,
          });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    // Проверяем, что общий размер разумный
    expect(totalSizeMB).toBeLessThan(5); // 5MB лимит
  });

  test('FPS is acceptable during rotation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    await page.waitForTimeout(2000);

    // Запускаем вращение
    await page.click('canvas');

    // Измеряем производительность
    const metrics = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        const duration = 2000; // 2 секунды

        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < duration) {
            requestAnimationFrame(countFrame);
          } else {
            const fps = (frameCount / duration) * 1000;
            resolve(fps);
          }
        }

        requestAnimationFrame(countFrame);
      });
    });

    // Проверяем, что FPS приемлемый (минимум 30 FPS)
    expect(metrics).toBeGreaterThan(30);
  });

  test('memory usage is stable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');

    // Получаем начальное использование памяти
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Переключаем книги несколько раз
    for (let i = 0; i < 5; i++) {
      await page.click('button[aria-label*="Меню"]');
      await page.waitForTimeout(300);
      await page.click('text=Книги');
      await page.waitForTimeout(300);

      // Кликаем на следующую книгу
      const bookButtons = await page.locator('button[data-book-id]').all();
      if (bookButtons.length > 0) {
        await bookButtons[i % bookButtons.length].click();
      }

      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Проверяем финальное использование памяти
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      // Проверяем, что утечка памяти не критична (< 50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);
    }
  });
});
