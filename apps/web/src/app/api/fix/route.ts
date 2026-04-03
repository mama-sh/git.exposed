import { NextResponse } from 'next/server';
import { db } from '@repo/shared/db';
import { scans, fixJobs, accounts, subscriptions } from '@repo/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const SCANNER_URL = process.env.SCANNER_BACKEND_URL;
const SCAN_SECRET = process.env.SCAN_SECRET || '';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  // Pro gate
  const [sub] = await db.select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, 'active')))
    .limit(1);
  if (!sub) {
    return NextResponse.json({ error: 'Pro subscription required', upgrade: true }, { status: 403 });
  }

  // Get GitHub token
  const [account] = await db.select()
    .from(accounts)
    .where(and(eq(accounts.userId, session.user.id), eq(accounts.provider, 'github')))
    .limit(1);
  if (!account?.access_token) {
    return NextResponse.json({ error: 'GitHub token not found. Please sign out and sign in again.' }, { status: 401 });
  }

  let body: { scanId?: string; findingIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { scanId, findingIds } = body;
  if (!scanId || !findingIds?.length) {
    return NextResponse.json({ error: 'scanId and findingIds required' }, { status: 400 });
  }

  // Look up repo info from scan
  const [scan] = await db.select().from(scans).where(eq(scans.id, scanId)).limit(1);
  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  // Create fix job record
  const [job] = await db.insert(fixJobs).values({
    scanId,
    userId: session.user.id,
    findingIds: JSON.stringify(findingIds),
  }).returning();

  // Delegate to backend
  if (SCANNER_URL) {
    try {
      const res = await fetch(`${SCANNER_URL}/fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SCAN_SECRET}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          owner: scan.repoOwner,
          repo: scan.repoName,
          findingIds,
          accessToken: account.access_token,
        }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    } catch (error) {
      console.error('Fix backend error:', error);
      await db.update(fixJobs).set({ status: 'failed', error: 'Backend unavailable' }).where(eq(fixJobs.id, job.id));
      return NextResponse.json({ error: 'Fix service unavailable' }, { status: 503 });
    }
  } else {
    return NextResponse.json({ error: 'Fix service not configured' }, { status: 503 });
  }

  return NextResponse.json({ jobId: job.id, status: 'pending' });
}
