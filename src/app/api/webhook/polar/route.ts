import { Webhooks } from '@polar-sh/nextjs';
import { db } from '@/db';
import { subscriptions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionCreated: async (payload) => {
    const { customer, id: polarSubId } = payload.data;
    if (!customer?.email) return;

    // Find user by email
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, customer.email))
      .limit(1);

    if (!user) return;

    await db.insert(subscriptions).values({
      userId: user.id,
      polarCustomerId: customer.id,
      polarSubscriptionId: polarSubId,
      status: 'active',
      currentPeriodEnd: payload.data.currentPeriodEnd
        ? new Date(payload.data.currentPeriodEnd)
        : null,
    });
  },
  onSubscriptionUpdated: async (payload) => {
    const { id: polarSubId } = payload.data;
    const status = payload.data.status;

    await db.update(subscriptions)
      .set({
        status: status === 'active' ? 'active' : status,
        currentPeriodEnd: payload.data.currentPeriodEnd
          ? new Date(payload.data.currentPeriodEnd)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.polarSubscriptionId, polarSubId));
  },
  onSubscriptionCanceled: async (payload) => {
    const { id: polarSubId } = payload.data;

    await db.update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.polarSubscriptionId, polarSubId));
  },
});
