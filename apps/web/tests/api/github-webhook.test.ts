import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

const SECRET = 'test-webhook-secret';

// Set env vars before any module import (route captures them at module scope)
vi.hoisted(() => {
  process.env.GITHUB_WEBHOOK_SECRET = 'test-webhook-secret';
  process.env.SCANNER_BACKEND_URL = 'https://scanner.test';
  process.env.SCAN_SECRET = 'scan-secret';
});

// Mock DB before importing the route
vi.mock('@repo/shared/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@repo/shared/db/schema', () => ({
  scans: { id: 'id', repoOwner: 'repo_owner', repoName: 'repo_name' },
  monitoredRepos: { repoOwner: 'repo_owner', repoName: 'repo_name', userId: 'user_id' },
  accounts: { userId: 'user_id', provider: 'provider' },
  subscriptions: { userId: 'user_id', status: 'status' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  and: vi.fn((...args) => args),
}));

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    repos: { createCommitStatus: vi.fn() },
  })),
}));

import { POST } from '@/app/api/webhook/github/route';
import { db } from '@repo/shared/db';

function makeSignature(body: string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

describe('GitHub webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock chain for DB operations
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-123' }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    // Mock global fetch for backend scan delegation
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  it('returns 401 with invalid signature', async () => {
    const body = JSON.stringify({ repository: { full_name: 'owner/repo' } });
    const req = new Request('http://localhost/api/webhook/github', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=invalidsignature',
        'x-github-event': 'push',
      },
      body,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid signature');
  });

  it('returns ok with skipped=true for non-push events', async () => {
    const body = JSON.stringify({ zen: 'Keep it logically awesome.' });
    const req = new Request('http://localhost/api/webhook/github', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': makeSignature(body, SECRET),
        'x-github-event': 'ping',
      },
      body,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.skipped).toBe(true);
  });

  it('returns 400 when repository is missing from payload', async () => {
    const body = JSON.stringify({ ref: 'refs/heads/main' });
    const req = new Request('http://localhost/api/webhook/github', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': makeSignature(body, SECRET),
        'x-github-event': 'push',
      },
      body,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing repository');
  });

  it('returns ok with reason "not monitored" when repo not in monitored_repos', async () => {
    // DB select returns empty (no monitored repo found)
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const body = JSON.stringify({ repository: { full_name: 'owner/repo' }, after: 'abc123' });
    const req = new Request('http://localhost/api/webhook/github', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': makeSignature(body, SECRET),
        'x-github-event': 'push',
      },
      body,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.reason).toBe('not monitored');
  });

  it('returns ok with reason "no pro subscription" when user sub is inactive', async () => {
    let selectCallCount = 0;
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First select: monitored repo found
          return Promise.resolve([{ userId: 'user-1', repoOwner: 'owner', repoName: 'repo' }]);
        }
        // Second select: no active subscription
        return Promise.resolve([]);
      }),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const body = JSON.stringify({ repository: { full_name: 'owner/repo' }, after: 'abc123' });
    const req = new Request('http://localhost/api/webhook/github', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': makeSignature(body, SECRET),
        'x-github-event': 'push',
      },
      body,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.reason).toBe('no pro subscription');
  });

  it('successfully triggers scan and returns scanId', async () => {
    let selectCallCount = 0;
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First select: monitored repo found
          return Promise.resolve([{ userId: 'user-1', repoOwner: 'owner', repoName: 'repo' }]);
        }
        if (selectCallCount === 2) {
          // Second select: active subscription found
          return Promise.resolve([{ userId: 'user-1', status: 'active' }]);
        }
        if (selectCallCount === 3) {
          // Third select: GitHub account found
          return Promise.resolve([{ userId: 'user-1', provider: 'github', access_token: 'gh-token-123' }]);
        }
        // Fourth select: scan result for commit status
        return Promise.resolve([{ id: 'scan-123', status: 'complete', grade: 'A', score: 95, findingsCount: 2 }]);
      }),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-123' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const body = JSON.stringify({ repository: { full_name: 'owner/repo' }, after: 'abc123' });
    const req = new Request('http://localhost/api/webhook/github', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': makeSignature(body, SECRET),
        'x-github-event': 'push',
      },
      body,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.scanId).toBe('scan-123');

    // Verify fetch was called to trigger the scanner
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://scanner.test/scan',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer scan-secret',
        }),
      }),
    );
  });
});
