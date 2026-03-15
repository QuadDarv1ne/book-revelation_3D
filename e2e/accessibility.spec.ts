import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper landmark regions', async ({ page }) => {
    // Проверяем наличие основных landmark регионов
    const mainRegion = page.locator('main[role="main"]');
    await expect(mainRegion).toBeVisible();

    const applicationRegion = page.locator('[role="application"]');
    await expect(applicationRegion).toHaveCount(1);
  });

  test('should have accessible buttons', async ({ page }) => {
    // Все кнопки должны иметь доступные имена
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      
      // Проверяем наличие aria-label или текста
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasText = await button.textContent();
      expect(hasAriaLabel || hasText?.trim()).toBeTruthy();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Проверяем что h1 идёт перед h2
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Проверяем что нет пропущенных уровней заголовков
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    
    let lastLevel = 0;
    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      
      // Разрешаем только последовательные уровни
      expect(level).toBeLessThanOrEqual(lastLevel + 1);
      lastLevel = level;
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Axe автоматически проверяет контрастность
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    // Фильтруем нарушения связанные с контрастом
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('color-contrast')
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should have focus indicators', async ({ page }) => {
    // Проверяем что элементы имеют видимый фокус
    const interactiveElements = page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);

    // Проверяем первый интерактивный элемент
    const firstElement = interactiveElements.first();
    await firstElement.focus();
    await expect(firstElement).toBeFocused();
  });

  test('should not have any aria-hidden focus issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-hidden-focus', 'area-alt', 'button-name'])
      .analyze();

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('should have proper form labels', async ({ page }) => {
    // Проверяем что все input имеют labels
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      
      // Пропускаем input без необходимости в label
      if (type === 'file') continue;

      const hasLabel = await input.evaluate(el => {
        return el.closest('label') !== null || 
               el.getAttribute('aria-labelledby') !== null ||
               el.getAttribute('aria-label') !== null ||
               el.id && document.querySelector(`label[for="${el.id}"]`) !== null;
      });

      expect(hasLabel).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab navigation
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocusedElement).toBeTruthy();

    // Shift+Tab
    await page.keyboard.press('Shift+Tab');
    const secondFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocusedElement).toBeTruthy();

    // Enter navigation
    await page.keyboard.press('Enter');
    
    // Escape should close modals
    await page.keyboard.press('Escape');
  });

  test('should have skip link', async ({ page }) => {
    const skipLink = page.locator('a[href="#quotes"], a[href="#controls"]');
    await expect(skipLink).toHaveCount(2);
    
    // Проверяем что skip link виден при фокусе
    await page.keyboard.press('Tab');
    await expect(skipLink.first()).toBeVisible();
  });

  test('should have proper image alt text', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt', 'area-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('should not have duplicate IDs', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['duplicate-id'])
      .analyze();

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });
});
