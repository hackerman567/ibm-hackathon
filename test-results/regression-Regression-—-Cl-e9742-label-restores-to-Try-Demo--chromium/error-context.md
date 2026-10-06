# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression.spec.js >> Regression — Classroom Demo Mode >> Stop Demo button deactivates demo — label restores to "Try Demo"
- Location: tests\regression.spec.js:31:7

# Error details

```
TimeoutError: page.goto: Timeout 10000ms exceeded.
Call log:
  - navigating to "http://localhost:5173/classroom", waiting until "load"

```

# Test source

```ts
  1   | /**
  2   |  * REGRESSION TESTS — Signify AI
  3   |  * Guards against breakage of critical user flows:
  4   |  *  - Demo mode activates and deactivates correctly
  5   |  *  - Tab switching in Classroom works
  6   |  *  - Ask AI panel input is gated on transcript
  7   |  *  - Settings toggles persist across navigation
  8   |  *  - Dashboard Refresh button re-renders stats
  9   |  *  - Dashboard confirm-clear modal open/cancel flow
  10  |  *  - Language selector changes value
  11  |  *  - Auto-translate toggle state reflects in UI
  12  |  *  - History page renders correctly
  13  |  *  - Server health endpoint returns ok
  14  |  */
  15  | import { test, expect } from '@playwright/test';
  16  | 
  17  | // ─── Classroom — Demo Mode Flow ──────────────────────────────────────────────
  18  | 
  19  | test.describe('Regression — Classroom Demo Mode', () => {
  20  |   test.beforeEach(async ({ page }) => {
> 21  |     await page.goto('/classroom');
      |                ^ TimeoutError: page.goto: Timeout 10000ms exceeded.
  22  |     await page.waitForLoadState('domcontentloaded');
  23  |   });
  24  | 
  25  |   test('Try Demo button activates demo — label changes to "Stop Demo"', async ({ page }) => {
  26  |     const demoBtn = page.getByRole('button', { name: /Try Demo/i });
  27  |     await demoBtn.click();
  28  |     await expect(page.getByRole('button', { name: /Stop Demo/i })).toBeVisible({ timeout: 8000 });
  29  |   });
  30  | 
  31  |   test('Stop Demo button deactivates demo — label restores to "Try Demo"', async ({ page }) => {
  32  |     await page.getByRole('button', { name: /Try Demo/i }).click();
  33  |     await expect(page.getByRole('button', { name: /Stop Demo/i })).toBeVisible({ timeout: 8000 });
  34  |     await page.getByRole('button', { name: /Stop Demo/i }).click();
  35  |     await expect(page.getByRole('button', { name: /Try Demo/i })).toBeVisible({ timeout: 8000 });
  36  |   });
  37  | 
  38  |   test('after demo starts, Live badge appears in caption header', async ({ page }) => {
  39  |     await page.getByRole('button', { name: /Try Demo/i }).click();
  40  |     await expect(page.getByText('Live', { exact: true })).toBeVisible({ timeout: 10000 });
  41  |   });
  42  | 
  43  |   test('demo produces caption content over time', async ({ page }) => {
  44  |     await page.getByRole('button', { name: /Try Demo/i }).click();
  45  |     // Wait for transcript lines to stream in (up to 15s)
  46  |     await expect(
  47  |       page.locator('.overflow-y-auto p').first()
  48  |     ).toBeVisible({ timeout: 15000 });
  49  |   });
  50  | });
  51  | 
  52  | // ─── Classroom — Tab Switching ────────────────────────────────────────────────
  53  | 
  54  | test.describe('Regression — Classroom Tab Panel', () => {
  55  |   test.beforeEach(async ({ page }) => {
  56  |     await page.goto('/classroom');
  57  |     await page.waitForLoadState('domcontentloaded');
  58  |   });
  59  | 
  60  |   test('default tab shows Summary Analysis / LectureSummarizer content', async ({ page }) => {
  61  |     await expect(
  62  |       page.getByText(/Generate Study Notes|Generate Notes/i).first()
  63  |     ).toBeVisible({ timeout: 6000 });
  64  |   });
  65  | 
  66  |   test('switching to Ask AI Tutor tab shows AI Assistant panel', async ({ page }) => {
  67  |     await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
  68  |     await expect(page.getByText('AI Assistant', { exact: false })).toBeVisible({ timeout: 5000 });
  69  |   });
  70  | 
  71  |   test('switching back to Summary Analysis tab restores summarizer', async ({ page }) => {
  72  |     await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
  73  |     await page.getByText(/Summary Analysis|AI Study Notes/i).first().click();
  74  |     await expect(
  75  |       page.getByText(/Generate Study Notes|Generate Notes/i).first()
  76  |     ).toBeVisible({ timeout: 5000 });
  77  |   });
  78  | 
  79  |   test('Ask AI input is disabled when no transcript exists', async ({ page }) => {
  80  |     await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
  81  |     // Target the AI chat input specifically by placeholder, not any first text input
  82  |     const input = page.locator('input[placeholder*="Start lecture"], input[placeholder*="Start recording"]').first();
  83  |     await expect(input).toBeDisabled({ timeout: 5000 });
  84  |   });
  85  | 
  86  |   test('Ask AI input placeholder indicates lecture must start first', async ({ page }) => {
  87  |     await page.getByText(/Ask AI Tutor|Ask AI/i).first().click();
  88  |     const input = page.locator('input[placeholder*="Start lecture"], input[placeholder*="Start recording"]').first();
  89  |     await expect(input).toBeVisible({ timeout: 5000 });
  90  |   });
  91  | });
  92  | 
  93  | // ─── Classroom — Language Selector ───────────────────────────────────────────
  94  | 
  95  | test.describe('Regression — Language Selector', () => {
  96  |   test('language dropdown can be changed from English to Spanish', async ({ page }) => {
  97  |     await page.goto('/classroom');
  98  |     await page.waitForLoadState('domcontentloaded');
  99  |     const select = page.locator('select').first();
  100 |     await select.selectOption('es');
  101 |     await expect(select).toHaveValue('es');
  102 |   });
  103 | 
  104 |   test('language dropdown can be changed back to English', async ({ page }) => {
  105 |     await page.goto('/classroom');
  106 |     await page.waitForLoadState('domcontentloaded');
  107 |     const select = page.locator('select').first();
  108 |     await select.selectOption('es');
  109 |     await select.selectOption('en');
  110 |     await expect(select).toHaveValue('en');
  111 |   });
  112 | });
  113 | 
  114 | // ─── Classroom — Auto-translate Toggle ───────────────────────────────────────
  115 | 
  116 | test.describe('Regression — Auto-translate Checkbox', () => {
  117 |   test('auto-translate checkbox can be toggled on and off', async ({ page }) => {
  118 |     await page.goto('/classroom');
  119 |     await page.waitForLoadState('domcontentloaded');
  120 |     const checkbox = page.locator('input[type="checkbox"]').first();
  121 |     const initial = await checkbox.isChecked();
```