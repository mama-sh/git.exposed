import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set env vars before route module loads (vi.hoisted runs before all imports)
vi.hoisted(() => {
  process.env.SCANNER_BACKEND_URL = 'http://localhost:4000';
  process.env.SCAN_SECRET = 'test-secret';
});

// Mock deps before importing
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@repo/shared/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@repo/shared/db/schema', () => ({
  fixJobs: { id: 'id', scanId: 'scan_id', userId: 'user_id', status: 'status' },
  scans: { id: 'id' },
  accounts: { userId: 'user_id', provider: 'provider' },
  subscriptions: { userId: 'user_id', status: 'status' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  and: vi.fn((...args) => args),
}));

import { POST } from '@/app/api/fix/route';
import { auth } from '@/lib/auth';
import { db } from '@repo/shared/db';

function makeRequest(body?: unknown): Request {
  return new Request('https://git.exposed/api/fix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('POST /api/fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SCANNER_BACKEND_URL', 'http://localhost:4000');
    vi.stubEnv('SCAN_SECRET', 'test-secret');
  });

  it('returns 401 when not authenticated', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await POST(makeRequest({ scanId: 'scan-1', findingIds: ['f1'] }));
    expect(res.status).toBe(401);
  });

  it('returns 403 when user has no Pro subscription', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const res = await POST(makeRequest({ scanId: 'scan-1', findingIds: ['f1'] }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.upgrade).toBe(true);
  });

  it('returns 401 when GitHub token not found', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    let callCount = 0;
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // subscription check: active
          return Promise.resolve([{ status: 'active' }]);
        }
        // account check: no token
        return Promise.resolve([{}]);
      }),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const res = await POST(makeRequest({ scanId: 'scan-1', findingIds: ['f1'] }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when scanId or findingIds missing', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    let callCount = 0;
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([{ status: 'active' }]);
        }
        return Promise.resolve([{ access_token: 'ghp_test' }]);
      }),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const res = await POST(makeRequest({ scanId: 'scan-1' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when scan not found', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    let callCount = 0;
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([{ status: 'active' }]);
        }
        if (callCount === 2) {
          return Promise.resolve([{ access_token: 'ghp_test' }]);
        }
        // scan lookup: not found
        return Promise.resolve([]);
      }),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const res = await POST(makeRequest({ scanId: 'scan-1', findingIds: ['f1', 'f2'] }));
    expect(res.status).toBe(404);
  });

  it('creates fix job and delegates to backend on success', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    let callCount = 0;
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([{ status: 'active' }]);
        }
        if (callCount === 2) {
          return Promise.resolve([{ access_token: 'ghp_test' }]);
        }
        // scan lookup
        return Promise.resolve([{ id: 'scan-1', repoOwner: 'owner', repoName: 'repo' }]);
      }),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'job-1' }]),
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertChain);

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const res = await POST(makeRequest({ scanId: 'scan-1', findingIds: ['f1', 'f2'] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.jobId).toBe('job-1');
    expect(json.status).toBe('pending');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/fix',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-secret',
        }),
      }),
    );
  });
});
