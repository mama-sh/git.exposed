import { test, expect } from '@playwright/test';

test.describe('git.exposed smoke tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/git\.exposed/);
    // Should have a scan input form
    await expect(page.locator('input[type="text"], input[type="url"]')).toBeVisible();
  });

  test('report page loads for a scanned repo', async ({ page }) => {
    await page.goto('/expressjs/express');
    // Should show score or auto-scan
    await expect(page.locator('body')).toContainText(/score|scanning|scan/i);
  });

  test('badge endpoint returns SVG', async ({ request }) => {
    const response = await request.get('/badge/expressjs/express');
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('image/svg');
  });

  test('scan API returns error for invalid URL', async ({ request }) => {
    const response = await request.post('/api/scan', {
      data: { url: 'not-a-github-url' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('fix API requires authentication', async ({ request }) => {
    const response = await request.post('/api/fix', {
      data: { scanId: 'fake', findingIds: ['fake'] },
    });
    expect(response.status()).toBe(401);
  });

  test('404 for nonexistent repo', async ({ page }) => {
    await page.goto('/nonexistent-user-abc123/nonexistent-repo-xyz789');
    // Should get 404 or auto-scan attempt
    await expect(page.locator('body')).toContainText(/not found|scanning|404/i);
  });
});
