import { test, expect } from '@playwright/test';

test.describe('security headers and input validation', () => {
  test('scan API rejects path traversal attempts', async ({ request }) => {
    const response = await request.post('/api/scan', {
      data: { url: 'https://github.com/../etc/passwd' },
    });
    // Returns 400 (invalid URL) — must not return 200 or trigger a scan
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('scan API rejects non-GitHub URLs', async ({ request }) => {
    const response = await request.post('/api/scan', {
      data: { url: 'https://gitlab.com/owner/repo' },
    });
    expect(response.status()).toBe(400);
  });
});
