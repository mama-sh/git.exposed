import { Checkout } from '@polar-sh/nextjs';

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: 'https://git.exposed/settings',
  server: (process.env.POLAR_ENV as 'sandbox' | 'production') || 'production',
});
