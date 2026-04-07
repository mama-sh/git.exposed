import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set env vars before any module import (route captures them at module scope)
vi.hoisted(() => {
  process.env.SCANNER_BACKEND_URL = 'https://scanner.test';
  process.env.SCAN_SECRET = 'scan-secret';
  process.env.GITHUB_WEBHOOK_SECRET = 'test-webhook-secret';
});

// --- Mocks ---

const mockCreateWebhook = vi.fn();

vi.mock('@repo/shared/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@repo/shared/db/schema', () => ({
  scans: {
    id: 'id',
    repoOwner: 'repo_owner',
    repoName: 'repo_name',
    status: 'status',
    createdAt: 'created_at',
  },
  monitoredRepos: {
    repoOwner: 'repo_owner',
    repoName: 'repo_name',
    userId: 'user_id',
  },
  accounts: { userId: 'user_id', provider: 'provider' },
  subscriptions: { userId: 'user_id', status: 'status' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  and: vi.fn((...args: unknown[]) => args),
  desc: vi.fn((col) => ({ desc: col })),
  gt: vi.fn((col, val) => ({ gt: col, val })),
}));

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(function () {
    return { repos: { createWebhook: mockCreateWebhook } };
  }),
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/scanner/run-scan', () => ({
  runScan: vi.fn(),
}));

vi.mock('@repo/shared/github', () => ({
  parseGitHubUrl: vi.fn((url: string) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length < 2) return null;
      return { owner: parts[0], repo: parts[1] };
    } catch {
      return null;
    }
  }),
}));

vi.mock('@repo/shared/validation', () => ({
  isValidRepoName: vi.fn((name: string) => /^[\w.-]+$/.test(name)),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({ allowed: true, remaining: 4 })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((name: string) => {
      if (name === 'x-forwarded-for') return '127.0.0.1';
      return null;
    }),
  })),
}));

import { POST } from '@/app/api/scan/route';
import { db } from '@repo/shared/db';
import { auth } from '@/lib/auth';

// Helper to make a scan request
function makeScanRequest(url = 'https://github.com/owner/repo') {
  return new Request('http://localhost/api/scan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

/**
 * Creates a mock select chain that handles both chained (.where().orderBy().limit())
 * and terminal (.where()) usage by making the returned object thenable.
 *
 * The scan route uses:
 *   1. db.select().from(scans).where(...).orderBy(...).limit(1)  — dedup check
 *   2. db.select().from(scans).where(eq(scans.id, scan.id))     — result fetch (NO .limit!)
 *   3. db.select().from(subscriptions).where(...).limit(1)       — hasProSubscription
 *   4. db.select().from(monitoredRepos).where(...).limit(1)      — existing check
 *   5. db.select().from(accounts).where(...).limit(1)            — getUserGitHubToken
 */
function createSelectChain(responses: Array<unknown[]>) {
  let callCount = 0;

  function getResponse() {
    const result = responses[callCount] ?? [];
    callCount++;
    return result;
  }

  // Build a chainable + thenable object
  function makeChainable(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    obj.from = vi.fn(() => obj);
    obj.where = vi.fn(() => {
      // Return a new thenable+chainable for this .where() result
      return makeThenableChainable();
    });
    return obj;
  }

  function makeThenableChainable(): Record<string, unknown> {
    // This object can be awaited directly (for .where() terminal calls)
    // or chained further (.orderBy(), .limit())
    const resolved = { _resolved: false, _value: null as unknown };
    const obj: Record<string, unknown> = {};

    function resolve() {
      if (!resolved._resolved) {
        resolved._resolved = true;
        resolved._value = getResponse();
      }
      return resolved._value;
    }

    obj.orderBy = vi.fn(() => obj);
    obj.limit = vi.fn(() => Promise.resolve(resolve()));
    obj.then = (onFulfill: (v: unknown) => unknown, onReject?: (e: unknown) => unknown) => {
      return Promise.resolve(resolve()).then(onFulfill, onReject);
    };
    return obj;
  }

  return makeChainable();
}

describe('Webhook auto-install during scan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateWebhook.mockReset();

    // Default: repo is public (isRepoPublic check via globalThis.fetch)
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('api.github.com/repos/')) {
        return Promise.resolve(
          new Response(JSON.stringify({ private: false }), { status: 200 }),
        );
      }
      // Scanner backend call
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    });
  });

  it('skips webhook install when user is not authenticated', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    // Call sequence: 1) dedup check, 2) result fetch
    const chain = createSelectChain([
      [], // dedup: no recent scan
      [{ id: 'scan-1', status: 'complete', grade: 'A', score: 95, findingsCount: 0 }],
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-1' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const res = await POST(makeScanRequest());
    expect(res.status).toBe(200);

    expect(mockCreateWebhook).not.toHaveBeenCalled();
    const insertCalls = (db.insert as ReturnType<typeof vi.fn>).mock.calls;
    expect(insertCalls.length).toBe(1); // only the scans insert
  });

  it('skips webhook install when user is not Pro', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    });

    // Call sequence: 1) dedup, 2) result, 3) hasProSubscription
    const chain = createSelectChain([
      [],
      [{ id: 'scan-1', status: 'complete', grade: 'B', score: 80, findingsCount: 3 }],
      [], // no subscription
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-1' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const res = await POST(makeScanRequest());
    expect(res.status).toBe(200);

    expect(mockCreateWebhook).not.toHaveBeenCalled();
    const insertCalls = (db.insert as ReturnType<typeof vi.fn>).mock.calls;
    expect(insertCalls.length).toBe(1);
  });

  it('skips webhook install when webhook already exists', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    });

    // Call sequence: 1) dedup, 2) result, 3) hasPro, 4) monitoredRepos existing check
    const chain = createSelectChain([
      [],
      [{ id: 'scan-1', status: 'complete', grade: 'A', score: 95, findingsCount: 1 }],
      [{ userId: 'user-1', status: 'active' }],
      [{ id: 'mon-1', userId: 'user-1', repoOwner: 'owner', repoName: 'repo', webhookId: 123 }],
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-1' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const res = await POST(makeScanRequest());
    expect(res.status).toBe(200);

    expect(mockCreateWebhook).not.toHaveBeenCalled();
    const insertCalls = (db.insert as ReturnType<typeof vi.fn>).mock.calls;
    expect(insertCalls.length).toBe(1);
  });

  it('creates webhook for new Pro user', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    });

    mockCreateWebhook.mockResolvedValue({ data: { id: 456 } });

    // Call sequence: 1) dedup, 2) result, 3) hasPro, 4) monitoredRepos (empty), 5) getUserGitHubToken
    const chain = createSelectChain([
      [],
      [{ id: 'scan-1', status: 'complete', grade: 'A', score: 98, findingsCount: 0 }],
      [{ userId: 'user-1', status: 'active' }],
      [], // no existing webhook
      [{ userId: 'user-1', provider: 'github', access_token: 'gh-token-abc' }],
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-1' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const res = await POST(makeScanRequest());
    expect(res.status).toBe(200);

    expect(mockCreateWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'owner',
        repo: 'repo',
        config: expect.objectContaining({
          url: 'https://git.exposed/api/webhook/github',
          content_type: 'json',
          secret: 'test-webhook-secret',
        }),
        events: ['push'],
        active: true,
      }),
    );

    // monitoredRepos insert was called (second insert, after scans insert)
    const insertCalls = (db.insert as ReturnType<typeof vi.fn>).mock.calls;
    expect(insertCalls.length).toBe(2);
  });

  it('webhook install failure does not break scan response', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
    });

    mockCreateWebhook.mockRejectedValue(new Error('GitHub API error: 403 Forbidden'));

    const chain = createSelectChain([
      [],
      [{ id: 'scan-1', status: 'complete', grade: 'C', score: 60, findingsCount: 5 }],
      [{ userId: 'user-1', status: 'active' }],
      [],
      [{ userId: 'user-1', provider: 'github', access_token: 'gh-token-abc' }],
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-1' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await POST(makeScanRequest());

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('scan-1');
    expect(json.status).toBe('complete');
    expect(json.grade).toBe('C');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Webhook install failed:',
      expect.stringContaining('403 Forbidden'),
    );

    consoleSpy.mockRestore();
  });
});
