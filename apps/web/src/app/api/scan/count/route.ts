import { db } from '@repo/shared/db';
import { scans } from '@repo/shared/db/schema';
import { count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const [result] = await db.select({ count: count() }).from(scans);
  return NextResponse.json(
    { count: result.count },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  );
}
