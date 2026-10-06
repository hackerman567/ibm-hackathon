/**
 * SMOKE TESTS — Signify AI
 * Verifies that every primary route loads without crashing,
 * the correct page title/heading is present, and no JS console errors occur.
 */
import { test, expect } from '@playwright/test';

// Collect console errors per test
function attachConsoleErrorCollector(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

test.describe('Smoke — Page Load', () => {
  test('Landing page loads and shows hero heading', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page);
    await page.goto('/');
    await expect(page).toHaveURL('/');
    // Hero heading text (updated in latest version)
    await expect(
      page.getByText(/Inclusive (Learning|Education)/i).first()
    ).toBeVisible({ timeout: 10000 });
    const fatal = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('socket') &&
      !e.includes('ECONNREFUSED')
    );
    expect(fatal, `Console errors:\n${fatal.join('\n')}`).toHaveLength(0);
  });

  test('Classroom page loads without crash', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page);
    await page.goto('/classroom');
    await expect(page.getByText('Begin Recording', { exact: false })).toBeVisible({ timeout: 10000 });
    const fatal = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('SpeechRecognition') &&
      !e.includes('socket') &&
      !e.includes('ECONNREFUSED')
    );
    expect(fatal, `Console errors:\n${fatal.join('\n')}`).toHaveLength(0);
  });

  test('Dashboard page loads and shows heading', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page);
    await page.goto('/dashboard');
    await expect(page.getByText('Learning Dashboard', { exact: false })).toBeVisible({ timeout: 10000 });
    const fatal = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('socket') &&
      !e.includes('ECONNREFUSED')
    );
    expect(fatal, `Console errors:\n${fatal.join('\n')}`).toHaveLength(0);
  });

  test('History page loads', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page);
    await page.goto('/history');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    const fatal = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('socket') &&
      !e.includes('ECONNREFUSED')
    );
    expect(fatal, `Console errors:\n${fatal.join('\n')}`).toHaveLength(0);
  });

  test('Settings page loads', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page);
    await page.goto('/settings');
    await expect(page.getByText('Settings', { exact: false }).first()).toBeVisible({ timeout: 10000 });
    const fatal = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('socket') &&
      !e.includes('ECONNREFUSED')
    );
    expect(fatal, `Console errors:\n${fatal.join('\n')}`).toHaveLength(0);
  });

  test('Sign Avatar page loads', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page);
    await page.goto('/avatar');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    const fatal = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('WebGL') &&
      !e.includes('THREE') &&
      !e.includes('socket') &&
      !e.includes('ECONNREFUSED')
    );
    expect(fatal, `Console errors:\n${fatal.join('\n')}`).toHaveLength(0);
  });

  test('Unknown route falls back to Landing', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await expect(
      page.getByText(/Inclusive (Learning|Education)/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('document title is set', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
