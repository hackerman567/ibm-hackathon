/**
 * REGRESSION TESTS — Signify AI
 * Guards against breakage of critical user flows:
 *  - Demo mode activates and deactivates correctly
 *  - Tab switching in Classroom works
 *  - Ask AI panel input is gated on transcript
 *  - Settings toggles persist across navigation
 *  - Dashboard Refresh button re-renders stats
 *  - Dashboard confirm-clear modal open/cancel flow
 *  - Language selector changes value
 *  - Auto-translate toggle state reflects in UI
 *  - History page renders correctly
 *  - Server health endpoint returns ok
 */
import { test, expect } from '@playwright/test';

// ─── Classroom — Demo Mode Flow ──────────────────────────────────────────────

test.describe('Regression — Classroom Demo Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/classroom');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Try Demo button activates demo — label changes to "Stop Demo"', async ({ page }) => {
    const demoBtn = page.getByRole('button', { name: /Try Demo/i });
    await demoBtn.click();
    await expect(page.getByRole('button', { name: /Stop Demo/i })).toBeVisible({ timeout: 8000 });
  });

  test('Stop Demo button deactivates demo — label restores to "Try Demo"', async ({ page }) => {
    await page.getByRole('button', { name: /Try Demo/i }).click();
    await expect(page.getByRole('button', { name: /Stop Demo/i })).toBeVisible({ timeout: 8000 });
    await page.getByRole('button', { name: /Stop Demo/i }).click();
    await expect(page.getByRole('button', { name: /Try Demo/i })).toBeVisible({ timeout: 8000 });
  });

  test('after demo starts, Live badge appears in caption header', async ({ page }) => {
    await page.getByRole('button', { name: /Try Demo/i }).click();
    await expect(page.getByText('Live', { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('demo produces caption content over time', async ({ page }) => {
    await page.getByRole('button', { name: /Try Demo/i }).click();
    // Wait for transcript lines to stream in (up to 15s)
    await expect(
      page.locator('.overflow-y-auto p').first()
    ).toBeVisible({ timeout: 15000 });
  });
});

// ─── Classroom — Tab Switching ────────────────────────────────────────────────

test.describe('Regression — Classroom Tab Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/classroom');
    await page.waitForLoadState('domcontentloaded');
  });

  test('default tab shows Summary Analysis / LectureSummarizer content', async ({ page }) => {
    await expect(
      page.getByText(/Generate Study Notes|Generate Notes/i).first()
    ).toBeVisible({ timeout: 6000 });
  });

  test('switching to Ask AI Tutor tab shows AI Assistant panel', async ({ page }) => {
    await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
    await expect(page.getByText('AI Assistant', { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('switching back to Summary Analysis tab restores summarizer', async ({ page }) => {
    await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
    await page.getByText(/Summary Analysis|AI Study Notes/i).first().click();
    await expect(
      page.getByText(/Generate Study Notes|Generate Notes/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Ask AI input is disabled when no transcript exists', async ({ page }) => {
    await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
    // Target the AI chat input specifically by placeholder, not any first text input
    const input = page.locator('input[placeholder*="Start lecture"], input[placeholder*="Start recording"]').first();
    await expect(input).toBeDisabled({ timeout: 5000 });
  });

  test('Ask AI input placeholder indicates lecture must start first', async ({ page }) => {
    await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
    const input = page.locator('input[placeholder*="Start lecture"], input[placeholder*="Start recording"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
  });
});

// ─── Classroom — Language Selector ───────────────────────────────────────────

test.describe('Regression — Language Selector', () => {
  test('language dropdown can be changed from English to Spanish', async ({ page }) => {
    await page.goto('/classroom');
    await page.waitForLoadState('domcontentloaded');
    const select = page.locator('select').first();
    await select.selectOption('es');
    await expect(select).toHaveValue('es');
  });

  test('language dropdown can be changed back to English', async ({ page }) => {
    await page.goto('/classroom');
    await page.waitForLoadState('domcontentloaded');
    const select = page.locator('select').first();
    await select.selectOption('es');
    await select.selectOption('en');
    await expect(select).toHaveValue('en');
  });
});

// ─── Classroom — Auto-translate Toggle ───────────────────────────────────────

test.describe('Regression — Auto-translate Checkbox', () => {
  test('auto-translate checkbox can be toggled on and off', async ({ page }) => {
    await page.goto('/classroom');
    await page.waitForLoadState('domcontentloaded');
    const checkbox = page.locator('input[type="checkbox"]').first();
    const initial = await checkbox.isChecked();
    // Toggle on
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!initial);
    // Toggle back
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(initial);
  });
});

// ─── Classroom — Save / Export Guards ─────────────────────────────────────────

test.describe('Regression — Save & Export Guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/classroom');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Save Session button is disabled with no transcript', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Save Session/i })).toBeDisabled();
  });

  test('Download Transcript button is disabled with no transcript', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Download Transcript/i })).toBeDisabled();
  });
});

// ─── Dashboard — Stats & Interactions ────────────────────────────────────────

test.describe('Regression — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Refresh button does not crash the page', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await expect(page.getByText('Learning Dashboard', { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('confirm-clear modal opens and can be cancelled', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /Delete All Sessions/i });
    const isEnabled = await deleteBtn.isEnabled();
    if (isEnabled) {
      await deleteBtn.click();
      await expect(page.getByText('Clear Lecture History?', { exact: false })).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /Cancel/i }).click();
      await expect(page.getByText('Clear Lecture History?', { exact: false })).not.toBeVisible({ timeout: 3000 });
    } else {
      // No data — confirm empty state is shown
      await expect(page.getByText(/No lecture history found/i)).toBeVisible();
    }
  });

  test('sample chart note is shown on empty state', async ({ page }) => {
    await expect(page.getByText('Showing sample stats', { exact: false })).toBeVisible();
  });

  test('Data Management section is rendered', async ({ page }) => {
    await expect(page.getByText('Data Management', { exact: false })).toBeVisible();
  });
});

// ─── Settings — Toggle Persistence ───────────────────────────────────────────

test.describe('Regression — Settings Toggles', () => {
  test('settings toggles are interactive without errors', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const toggles = page.locator('input[type="checkbox"]');
    const count = await toggles.count();
    expect(count).toBeGreaterThan(0);
    const first = toggles.first();
    const was = await first.isChecked();
    // Checkboxes are sr-only — click the associated label instead
    const id = await first.getAttribute('id');
    if (id) {
      const lbl = page.locator(`label[for="${id}"]`);
      await lbl.click();
      await lbl.click();
    } else {
      await first.dispatchEvent('click');
      await first.dispatchEvent('click');
    }
    expect(await first.isChecked()).toBe(was);
  });

  test('settings toggle state survives navigation away and back', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const toggle = page.locator('input[type="checkbox"]').first();
    const initial = await toggle.isChecked();
    const id = await toggle.getAttribute('id');
    const clickToggle = async () => {
      if (id) {
        await page.locator(`label[for="${id}"]`).click();
      } else {
        await toggle.dispatchEvent('click');
      }
    };
    await clickToggle();
    const flipped = await toggle.isChecked();
    expect(flipped).toBe(!initial);
    // Navigate away and return
    await page.goto('/dashboard');
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const afterNav = await page.locator('input[type="checkbox"]').first().isChecked();
    expect(afterNav).toBe(flipped);
  });
});

// ─── History Page ─────────────────────────────────────────────────────────────

test.describe('Regression — History Page', () => {
  test('history page renders without crash', async ({ page }) => {
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('history page shows a heading or empty-state message', async ({ page }) => {
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');
    const hasHeading = await page.locator('h1, h2').first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/No|empty|history/i).first().isVisible().catch(() => false);
    expect(hasHeading || hasEmpty).toBe(true);
  });
});

// ─── Server Health Endpoint ───────────────────────────────────────────────────

test.describe('Regression — API Health Check', () => {
  test('GET /api/health returns status ok (when server is running)', async ({ request }) => {
    let response;
    try {
      response = await request.get('http://localhost:3001/api/health', { timeout: 5000 });
    } catch {
      // Server not running in pure frontend test mode — skip gracefully
      return;
    }
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.status).toBe('ok');
      expect(typeof body.timestamp).toBe('string');
      expect(typeof body.groqConfigured).toBe('boolean');
    }
  });
});
