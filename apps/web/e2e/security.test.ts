import { test, expect } from '@playwright/test';

test.describe('security headers and auth gates', () => {
  test('fix API rejects unauthenticated POST', async ({ request }) => {
    const response = await request.post('/api/fix', {
      data: { scanId: 'test', findingIds: ['a', 'b'] },
    });
    expect(response.status()).toBe(401);
  });

  test('fix status API rejects unauthenticated GET', async ({ request }) => {
    const response = await request.get('/api/fix/some-uuid');
    expect(response.status()).toBe(401);
  });

  test('checkout POST rejects unauthenticated request', async ({ request }) => {
    const response = await request.post('/api/checkout');
    expect(response.status()).toBe(401);
  });

  test('webhook rejects request without signature', async ({ request }) => {
    const response = await request.post('/api/webhook/github', {
      data: { repository: { full_name: 'test/repo' }, after: 'abc123' },
      headers: { 'x-github-event': 'push' },
    });
    expect(response.status()).toBe(401);
  });

  test('webhook rejects request with tampered signature', async ({ request }) => {
    const response = await request.post('/api/webhook/github', {
      data: { repository: { full_name: 'test/repo' }, after: 'abc123' },
      headers: {
        'x-github-event': 'push',
        'x-hub-signature-256': 'sha256=0000000000000000000000000000000000000000000000000000000000000000',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('scan API rejects path traversal attempts', async ({ request }) => {
    const response = await request.post('/api/scan', {
      data: { url: 'https://github.com/../etc/passwd' },
    });
    // Returns 400 (invalid URL) or 401 (parsed as private repo needing auth)
    // Either way, it must not return 200 or trigger a scan
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('scan API rejects non-GitHub URLs', async ({ request }) => {
    const response = await request.post('/api/scan', {
      data: { url: 'https://gitlab.com/owner/repo' },
    });
    expect(response.status()).toBe(400);
  });
});
