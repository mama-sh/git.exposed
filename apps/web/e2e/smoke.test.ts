import { test, expect } from '@playwright/test';

test.describe('API smoke tests', () => {
  test('health: badge endpoint returns SVG', async ({ request }) => {
    const response = await request.get('/badge/expressjs/express');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg');
  });

  test('scan: rejects invalid GitHub URL', async ({ request }) => {
    const response = await request.post('/api/scan', {
      data: { url: 'not-a-github-url' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('scan: rejects missing URL', async ({ request }) => {
    const response = await request.post('/api/scan', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('fix: requires authentication', async ({ request }) => {
    const response = await request.post('/api/fix', {
      data: { scanId: 'fake', findingIds: ['f1'] },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Sign in');
  });

  test('fix status: requires authentication', async ({ request }) => {
    const response = await request.get('/api/fix/nonexistent-job-id');
    expect(response.status()).toBe(401);
  });

  test('checkout: redirects unauthenticated users to sign-in', async ({ request }) => {
    const response = await request.get('/api/checkout', { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()['location']).toContain('/signin');
  });

  test('webhook: rejects invalid signature', async ({ request }) => {
    const response = await request.post('/api/webhook/github', {
      data: { repository: { full_name: 'test/repo' } },
      headers: {
        'x-hub-signature-256': 'sha256=invalid',
        'x-github-event': 'push',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('webhook: handles non-push events gracefully', async ({ request }) => {
    // ping events should not 500 — they may 401 without valid sig
    const response = await request.post('/api/webhook/github', {
      data: {},
      headers: {
        'x-github-event': 'ping',
      },
    });
    // Will be 401 (invalid sig) which is correct behavior
    expect(response.status()).toBeLessThan(500);
  });

  test('auth: session endpoint is accessible', async ({ request }) => {
    const response = await request.get('/api/auth/session');
    expect(response.status()).toBe(200);
  });

  test('auth: providers endpoint is accessible', async ({ request }) => {
    const response = await request.get('/api/auth/providers');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.github).toBeDefined();
  });

  test('scan count: returns number', async ({ request }) => {
    const response = await request.get('/api/scan/count');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.count).toBe('number');
    expect(body.count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('page accessibility', () => {
  test('report page returns 200 for scanned repo', async ({ request }) => {
    const response = await request.get('/expressjs/express');
    expect(response.status()).toBe(200);
  });

  test('landing page returns 200', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
  });

  test('signin page returns 200', async ({ request }) => {
    const response = await request.get('/signin');
    // May redirect (307) if already signed in, or 200 for sign-in page
    expect(response.status()).toBeLessThan(400);
  });
});
