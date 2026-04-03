import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getRealDb } from '@repo/shared/db';
import { users, accounts, sessions, verificationTokens } from '@repo/shared/db/schema';

// Lazy adapter — caches the real adapter after first access so Auth.js
// gets a stable instance, but the DB connection is deferred past build time.
let _adapter: ReturnType<typeof DrizzleAdapter> | undefined;
function getAdapter() {
  if (!_adapter) {
    _adapter = DrizzleAdapter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getRealDb() as any,
      {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    );
  }
  return _adapter;
}

const lazyAdapter = new Proxy({} as ReturnType<typeof DrizzleAdapter>, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getAdapter() as any)[prop];
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: lazyAdapter,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: 'read:user user:email repo' } },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
});
