import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock deps before importing
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@repo/shared/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('@repo/shared/db/schema', () => ({
  fixJobs: { id: 'id', userId: 'user_id', status: 'status' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

import { GET } from '@/app/api/fix/[jobId]/route';
import { auth } from '@/lib/auth';
import { db } from '@repo/shared/db';

function makeRequest(jobId: string): Request {
  return new Request(`https://git.exposed/api/fix/${jobId}`, { method: 'GET' });
}

describe('GET /api/fix/[jobId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await GET(makeRequest('job-1'), {
      params: Promise.resolve({ jobId: 'job-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 404 when job not found', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const res = await GET(makeRequest('job-1'), {
      params: Promise.resolve({ jobId: 'job-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 404 when job belongs to different user', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{
        id: 'job-1',
        userId: 'other-user',
        status: 'pending',
      }]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const res = await GET(makeRequest('job-1'), {
      params: Promise.resolve({ jobId: 'job-1' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns job status successfully', async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1' },
    });

    const mockJob = {
      id: 'job-1',
      userId: 'u1',
      status: 'completed',
      prUrl: 'https://github.com/owner/repo/pull/42',
      error: null,
      createdAt: '2026-04-01T00:00:00Z',
      completedAt: '2026-04-01T00:01:00Z',
    };

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockJob]),
    };
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectChain);

    const res = await GET(makeRequest('job-1'), {
      params: Promise.resolve({ jobId: 'job-1' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('job-1');
    expect(json.status).toBe('completed');
    expect(json.prUrl).toBe('https://github.com/owner/repo/pull/42');
    expect(json.error).toBeNull();
    expect(json.createdAt).toBe('2026-04-01T00:00:00Z');
    expect(json.completedAt).toBe('2026-04-01T00:01:00Z');
  });
});
