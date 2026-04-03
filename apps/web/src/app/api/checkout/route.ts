import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

async function createCheckoutUrl(email: string, name: string | null | undefined, userId: string) {
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID!;

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email,
      name: name ?? undefined,
      custom: {
        user_id: userId,
      },
    },
    productOptions: {
      redirectUrl: 'https://git.exposed/settings',
    },
  });

  return checkout.data?.data.attributes.url ?? null;
}

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    // Redirect to sign-in, then back to checkout after auth
    return NextResponse.redirect(new URL('/signin?callbackUrl=/api/checkout', _req.url));
  }

  const url = await createCheckoutUrl(session.user.email, session.user.name, session.user.id!);
  if (!url) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }

  return NextResponse.redirect(url);
}

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = await createCheckoutUrl(session.user.email, session.user.name, session.user.id!);
  if (!url) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }

  return NextResponse.json({ url });
}
