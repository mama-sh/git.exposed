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
  Octokit: vi.fn().mockImplementation(function () {
    return { repos: { createCommitStatus: vi.fn() } };
  }),
}));

import { POST } from '@/app/api/webhook/github/route';
import { db } from '@repo/shared/db';

function makeSignature(body: string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Creates a mock select chain where .where() returns a thenable+chainable object.
 * This handles both terminal .where() usage (awaited directly) and chained .limit() calls.
 *
 * Webhook route DB call sequence:
 *   1. db.select().from(monitoredRepos).where(...).limit(1)
 *   2. db.select().from(subscriptions).where(...).limit(1)
 *   3. db.select().from(accounts).where(...).limit(1)
 *   4. db.insert(scans).values(...).returning()
 *   5. db.select().from(scans).where(eq(scans.id, scan.id))  — NO .limit()!
 */
function createSelectChain(responses: Array<unknown[]>) {
  let callCount = 0;

  function getResponse() {
    const result = responses[callCount] ?? [];
    callCount++;
    return result;
  }

  function makeChainable(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    obj.from = vi.fn(() => obj);
    obj.where = vi.fn(() => makeThenableChainable());
    return obj;
  }

  function makeThenableChainable(): Record<string, unknown> {
    const resolved = { _done: false, _value: null as unknown };
    const obj: Record<string, unknown> = {};

    function resolve() {
      if (!resolved._done) {
        resolved._done = true;
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

describe('GitHub webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock chain for DB operations (simple version for basic tests)
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

  it('posts commit status after successful scan', async () => {
    const mockCreateCommitStatus = vi.fn().mockResolvedValue({});

    const { Octokit } = await import('@octokit/rest');
    (Octokit as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return { repos: { createCommitStatus: mockCreateCommitStatus } };
    });

    // Use thenable chain: calls 1-3 use .limit(), call 4 is terminal .where()
    const chain = createSelectChain([
      [{ userId: 'user-1', repoOwner: 'owner', repoName: 'repo' }], // monitored repo
      [{ userId: 'user-1', status: 'active' }],                      // subscription
      [{ userId: 'user-1', provider: 'github', access_token: 'gh-token-123' }], // account
      [{ id: 'scan-123', status: 'complete', grade: 'A', score: 95, findingsCount: 2 }], // scan result
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-123' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const body = JSON.stringify({ repository: { full_name: 'owner/repo' }, after: 'abc123def456' });
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

    expect(mockCreateCommitStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'owner',
        repo: 'repo',
        sha: 'abc123def456',
        state: 'success',
        context: 'git.exposed/security',
      }),
    );
  });

  it('commit status uses failure for grade F', async () => {
    const mockCreateCommitStatus = vi.fn().mockResolvedValue({});

    const { Octokit } = await import('@octokit/rest');
    (Octokit as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return { repos: { createCommitStatus: mockCreateCommitStatus } };
    });

    const chain = createSelectChain([
      [{ userId: 'user-1', repoOwner: 'owner', repoName: 'repo' }],
      [{ userId: 'user-1', status: 'active' }],
      [{ userId: 'user-1', provider: 'github', access_token: 'gh-token-123' }],
      [{ id: 'scan-123', status: 'complete', grade: 'F', score: 15, findingsCount: 42 }],
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-123' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    const body = JSON.stringify({ repository: { full_name: 'owner/repo' }, after: 'deadbeef' });
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

    expect(mockCreateCommitStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'failure',
        sha: 'deadbeef',
        context: 'git.exposed/security',
      }),
    );
  });

  it('rejects invalid repo names in webhook payload', async () => {
    // Use characters that fail isValidRepoName: /^[\w.-]+$/
    const body = JSON.stringify({ repository: { full_name: 'bad name/re po' }, after: 'abc123' });
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
    expect(json.error).toBe('Invalid repo name');
  });

  it('handles missing after sha gracefully', async () => {
    const mockCreateCommitStatus = vi.fn().mockResolvedValue({});

    const { Octokit } = await import('@octokit/rest');
    (Octokit as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return { repos: { createCommitStatus: mockCreateCommitStatus } };
    });

    // Full flow but no commit status because headSha is undefined
    const chain = createSelectChain([
      [{ userId: 'user-1', repoOwner: 'owner', repoName: 'repo' }],
      [{ userId: 'user-1', status: 'active' }],
      [{ userId: 'user-1', provider: 'github', access_token: 'gh-token-123' }],
      // The scan result select won't even be reached because headSha is falsy
    ]);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'scan-123' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    // No "after" field in payload
    const body = JSON.stringify({ repository: { full_name: 'owner/repo' } });
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

    // Commit status should NOT have been called (no sha)
    expect(mockCreateCommitStatus).not.toHaveBeenCalled();
  });
});
