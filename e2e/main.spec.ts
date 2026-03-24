import { test, expect } from '@playwright/test';

test.describe('Book Revelation 3D - Main Page', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Book Revelation 3D/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display quotes panel', async ({ page }) => {
    await page.goto('/');

    const quotesPanel = page.getByLabel('Цитаты стоических философов');
    await expect(quotesPanel).toBeVisible();
  });

  test('should display control button', async ({ page }) => {
    await page.goto('/');

    const controlButton = page.getByLabel(/Пауза|Вращение/);
    await expect(controlButton).toBeVisible();
  });

  test('should toggle rotation on button click', async ({ page }) => {
    await page.goto('/');

    const controlButton = page.getByLabel(/Пауза|Вращение/);
    await expect(controlButton).toContainText('Пауза');

    await controlButton.click();
    await expect(controlButton).toContainText('Вращение');

    await controlButton.click();
    await expect(controlButton).toContainText('Пауза');
  });

  test('should display all books', async ({ page }) => {
    await page.goto('/');

    const bookSelector = page.getByRole('button', { name: 'Выбрать книгу' });
    await expect(bookSelector).toBeVisible();

    await bookSelector.click();

    // Проверяем наличие всех 6 книг (ищем в options списка)
    const bookList = page.getByRole('listbox');
    await expect(bookList).toBeVisible();
    await expect(bookList.getByText('Марк Аврелий').first()).toBeVisible();
    await expect(bookList.getByText('Эпиктет').first()).toBeVisible();
    await expect(bookList.getByText('Сенека').first()).toBeVisible();
    await expect(bookList.getByText('Сунь-цзы').first()).toBeVisible();
    await expect(bookList.getByText('Стивен Хокинг').first()).toBeVisible();
    await expect(bookList.getByText('Клейтон Кристенсен').first()).toBeVisible();
  });

  test('should switch between books', async ({ page }) => {
    await page.goto('/');

    const bookSelector = page.getByRole('button', { name: 'Выбрать книгу' });
    await bookSelector.click();

    // Выбираем книгу Эпиктета (ищем конкретный option в списке)
    const bookList = page.getByRole('listbox');
    await bookList.getByText('Наше благо').first().click();

    // Проверяем, что книга выбрана (по заголовку или первой цитате)
    await expect(page.getByText('Эпиктет').first()).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Нажатие пробела должно ставить на паузу
    await page.keyboard.press('Space');
    const controlButton = page.getByLabel('Вращение');
    await expect(controlButton).toBeVisible();

    // Повторное нажатие должно запустить вращение
    await page.keyboard.press('Space');
    await expect(page.getByLabel('Пауза')).toBeVisible();
  });

  test('should support Zen mode', async ({ page }) => {
    await page.goto('/');

    // Нажатие Z включает Zen режим
    await page.keyboard.press('Z');
    
    // Проверяем, что UI скрыт
    const settingsBar = page.getByLabel('Настройки');
    await expect(settingsBar).not.toBeVisible();
    
    // Нажатие Esc выключает Zen режим
    await page.keyboard.press('Escape');
    await expect(settingsBar).toBeVisible();
  });

  test('should have accessible skip links', async ({ page }) => {
    await page.goto('/');

    // Проверяем наличие skip links
    const skipToQuotes = page.getByRole('link', { name: 'Перейти к цитатам' });
    await expect(skipToQuotes).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Проверяем ARIA labels
    const mainRegion = page.getByRole('main');
    await expect(mainRegion).toBeVisible();

    const quotesRegion = page.getByRole('region', { name: 'Цитаты стоических философов' });
    await expect(quotesRegion).toBeVisible();

    // Book listbox может быть скрыт, открываем его сначала
    const bookSelector = page.getByRole('button', { name: 'Выбрать книгу' });
    await bookSelector.click();
    const bookListbox = page.getByRole('listbox');
    await expect(bookListbox).toBeVisible();
  });

  test('should display quotes', async ({ page }) => {
    await page.goto('/');

    // Проверяем, что цитаты отображаются (хотя бы несколько)
    const quoteCards = page.locator('[class*="QuoteCard"]');
    await expect(quoteCards).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Выбрать книгу' })).toBeVisible();
  });

  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/');

    const manifest = page.locator('link[rel="manifest"]').first();
    await expect(manifest).toHaveAttribute('href', '/manifest.json');

    // Проверяем, что manifest загружается
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();
  });

  test('should have service worker registered', async ({ page }) => {
    await page.goto('/');
    
    // Ждём регистрации service worker
    await page.waitForLoadState('networkidle');
    
    const serviceWorker = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null || 
             navigator.serviceWorker.ready.then(() => true).catch(() => false);
    });
    
    expect(serviceWorker).toBeTruthy();
  });
});
