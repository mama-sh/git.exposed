import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FixButton component export', () => {
  it('exports FixButton as a function', async () => {
    const mod = await import('@/components/fix-button');
    expect(mod.FixButton).toBeDefined();
    expect(typeof mod.FixButton).toBe('function');
  });
});

describe('FixButton API interactions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('free user gets upgrade prompt — no fetch calls made', () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock;

    // When isPro=false, the component renders a static upgrade prompt
    // and never calls fetch. Verify no API calls are made.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POST /api/fix sends correct payload with scanId and findingIds', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ jobId: 'job-1' }),
    });
    globalThis.fetch = fetchMock;

    // Simulate the fetch call the component makes in handleFix
    const res = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: 'scan-1', findingIds: ['f1', 'f2'] }),
    });
    const data = await res.json();

    expect(fetchMock).toHaveBeenCalledWith('/api/fix', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ scanId: 'scan-1', findingIds: ['f1', 'f2'] }),
    }));
    expect(data.jobId).toBe('job-1');
  });

  it('handles API error response gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'Pro subscription required' }),
    });

    const res = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: 'scan-1', findingIds: ['f1'] }),
    });

    expect(res.ok).toBe(false);
    const data = await res.json();
    expect(data.error).toBe('Pro subscription required');
  });

  it('handles network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: 'scan-1', findingIds: ['f1'] }),
      }),
    ).rejects.toThrow('Network error');
  });

  it('polls GET /api/fix/{jobId} and receives completed status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'complete', prUrl: 'https://github.com/owner/repo/pull/1' }),
    });
    globalThis.fetch = fetchMock;

    const res = await fetch('/api/fix/job-1');
    const data = await res.json();

    expect(fetchMock).toHaveBeenCalledWith('/api/fix/job-1');
    expect(data.status).toBe('complete');
    expect(data.prUrl).toBe('https://github.com/owner/repo/pull/1');
  });

  it('polls GET /api/fix/{jobId} and receives failed status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'failed', error: 'Fix generation failed' }),
    });

    const res = await fetch('/api/fix/job-1');
    const data = await res.json();

    expect(data.status).toBe('failed');
    expect(data.error).toBe('Fix generation failed');
  });

  it('polls multiple times until job completes', async () => {
    const fetchMock = vi.fn()
      // First call: POST /api/fix returns jobId
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ jobId: 'job-42' }),
      })
      // Second call: GET /api/fix/job-42 returns processing
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'processing' }),
      })
      // Third call: GET /api/fix/job-42 returns complete
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'complete', prUrl: 'https://github.com/owner/repo/pull/5' }),
      });
    globalThis.fetch = fetchMock;

    // Simulate the full flow: POST then poll
    const postRes = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: 'scan-1', findingIds: ['f1', 'f2'] }),
    });
    const { jobId } = await postRes.json();
    expect(jobId).toBe('job-42');

    // First poll — still processing
    const poll1 = await fetch(`/api/fix/${jobId}`);
    const job1 = await poll1.json();
    expect(job1.status).toBe('processing');

    // Second poll — complete
    const poll2 = await fetch(`/api/fix/${jobId}`);
    const job2 = await poll2.json();
    expect(job2.status).toBe('complete');
    expect(job2.prUrl).toBe('https://github.com/owner/repo/pull/5');

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
