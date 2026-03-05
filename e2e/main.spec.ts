import { test, expect } from '@playwright/test';

test.describe('Stoic Book 3D - Main Page', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Stoic Book 3D/);
    await expect(page.locator('h1')).toContainText('В чём наше благо?');
  });

  test('should display quotes panel', async ({ page }) => {
    await page.goto('/');
    
    const quotesPanel = page.locator('text=Марк Аврелий & Эпиктет').first();
    await expect(quotesPanel).toBeVisible();
  });

  test('should display control button', async ({ page }) => {
    await page.goto('/');
    
    const controlButton = page.locator('button');
    await expect(controlButton).toBeVisible();
    await expect(controlButton).toContainText(/Пауза|Вращение/);
  });

  test('should toggle rotation on button click', async ({ page }) => {
    await page.goto('/');
    
    const controlButton = page.locator('button').first();
    await expect(controlButton).toContainText('Пауза');
    
    await controlButton.click();
    await expect(controlButton).toContainText('Вращение');
    
    await controlButton.click();
    await expect(controlButton).toContainText('Пауза');
  });

  test('should display all 50 quotes', async ({ page }) => {
    await page.goto('/');
    
    const quoteCards = page.locator('[class*="QuoteCard"]');
    await expect(quoteCards).toHaveCount(50);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
  });
});
