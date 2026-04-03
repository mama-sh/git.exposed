import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scans } from '@/db/schema';
import { parseGitHubUrl } from '@/scanner/github';
import { runScan } from '@/scanner/run-scan';

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const info = parseGitHubUrl(url);
  if (!info) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }

  const [scan] = await db.insert(scans).values({
    repoOwner: info.owner,
    repoName: info.repo,
    repoUrl: url,
  }).returning();

  // Fire and forget — scan runs in background
  runScan(scan.id, info.owner, info.repo).catch(console.error);

  return NextResponse.json({
    id: scan.id,
    reportUrl: `/r/${info.owner}/${info.repo}`,
  });
}
