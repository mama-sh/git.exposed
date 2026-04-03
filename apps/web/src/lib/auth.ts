import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getRealDb } from '@repo/shared/db';
import { users, accounts, sessions, verificationTokens } from '@repo/shared/db/schema';

// Known adapter method names that Auth.js checks for during initialization.
// The Proxy reports these as existing without creating the adapter.
const ADAPTER_METHODS = [
  'createUser', 'getUser', 'getUserByEmail', 'getUserByAccount',
  'updateUser', 'deleteUser', 'linkAccount', 'unlinkAccount',
  'createSession', 'getSessionAndUser', 'updateSession', 'deleteSession',
  'createVerificationToken', 'useVerificationToken',
];

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
    if (typeof prop === 'string' && ADAPTER_METHODS.includes(prop)) {
      // Return a function that lazily creates the adapter and delegates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) => (getAdapter() as any)[prop](...args);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getAdapter() as any)[prop];
  },
  has(_, prop) {
    if (typeof prop === 'string' && ADAPTER_METHODS.includes(prop)) return true;
    return prop in getAdapter();
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
