import { CustomerPortal } from '@polar-sh/nextjs';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async () => {
    const session = await auth();
    if (!session?.user?.id) return '';

    const [sub] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    return sub?.polarCustomerId || '';
  },
  server: (process.env.POLAR_ENV as 'sandbox' | 'production') || 'production',
});
