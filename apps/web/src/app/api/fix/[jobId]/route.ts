import { NextResponse } from 'next/server';
import { db } from '@repo/shared/db';
import { fixJobs } from '@repo/shared/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface Props {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { jobId } = await params;
  const [job] = await db.select().from(fixJobs).where(eq(fixJobs.id, jobId)).limit(1);

  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    prUrl: job.prUrl,
    error: job.error,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
}
