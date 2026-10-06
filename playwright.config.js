// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: 3,
  timeout: 15000,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 8000,
    navigationTimeout: 10000,
    permissions: ['microphone'],
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'npx vite',
    cwd: './client',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
