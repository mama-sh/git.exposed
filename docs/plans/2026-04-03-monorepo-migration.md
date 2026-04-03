# Monorepo Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Migrate git.exposed from a flat Next.js project with a nested `backend/` directory into a Turborepo monorepo with `apps/web`, `apps/api`, and `packages/shared`.

**Architecture:** pnpm workspaces + Turborepo for task orchestration. Shared internal package (no build step — TypeScript sources consumed directly). Frontend deployed to Vercel, backend to Railway, both auto-deploying on push.

**Tech Stack:** pnpm, Turborepo, Next.js 16, Hono, Drizzle ORM, Neon PostgreSQL, Vitest

---

### Task 0: Initialize monorepo scaffolding

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Modify: `package.json` (root)
- Create: `.npmrc`
- Delete: `package-lock.json`

**Step 1: Install pnpm (if not installed) and create workspace config**

```bash
corepack enable && corepack prepare pnpm@latest --activate
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 2: Create `.npmrc`**

```ini
shamefully-hoist=true
```

> `shamefully-hoist=true` is needed because Next.js expects certain dependencies to be hoisted. Without it, build errors occur from unresolved peer deps.

**Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {},
    "lint": {}
  }
}
```

**Step 4: Update root `package.json`**

Replace entire file:
```json
{
  "name": "git-exposed",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "pnpm@10.8.1"
}
```

**Step 5: Delete old lockfile**

```bash
rm package-lock.json
rm -rf node_modules
```

**Step 6: Commit**

```bash
git add pnpm-workspace.yaml turbo.json .npmrc package.json
git rm package-lock.json
git commit -m "chore: initialize pnpm + Turborepo monorepo scaffolding"
```

---

### Task 1: Create shared package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/db/schema.ts` (move from `src/db/schema.ts`)
- Create: `packages/shared/src/db/index.ts` (move from `src/db/index.ts`)
- Create: `packages/shared/src/types.ts` (move from `src/scanner/types.ts`)
- Create: `packages/shared/src/scoring.ts` (move from `src/scanner/scoring.ts`)
- Create: `packages/shared/src/github.ts` (move from `src/scanner/github.ts`)
- Create: `packages/shared/src/validation.ts` (new)

**Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "@repo/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./db": "./src/db/index.ts",
    "./db/schema": "./src/db/schema.ts",
    "./types": "./src/types.ts",
    "./scoring": "./src/scoring.ts",
    "./github": "./src/github.ts",
    "./validation": "./src/validation.ts"
  },
  "dependencies": {
    "@neondatabase/serverless": "^1.0.2",
    "drizzle-orm": "^0.45.2",
    "tar": "^7.5.13"
  },
  "devDependencies": {
    "@types/node": "^20",
    "typescript": "^5"
  }
}
```

> This is an "internal package" — no build step. `exports` point directly to TypeScript source files. Both apps consume them via their own transpilation (Next.js for web, tsx for api).

**Step 2: Create `packages/shared/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Step 3: Move database files**

```bash
mkdir -p packages/shared/src/db
git mv src/db/schema.ts packages/shared/src/db/schema.ts
git mv src/db/index.ts packages/shared/src/db/index.ts
```

The files are identical in frontend and backend. The backend copies will be deleted in Task 3.

**Step 4: Move type definitions**

```bash
git mv src/scanner/types.ts packages/shared/src/types.ts
```

The `Finding`, `Severity`, `Check`, and `ScanResult` types move here. `Check` and `ScanResult` are frontend-only but harmless to export from shared.

**Step 5: Move scoring module**

```bash
git mv src/scanner/scoring.ts packages/shared/src/scoring.ts
```

Update the import path inside `packages/shared/src/scoring.ts`:

```typescript
import type { Finding, Severity } from './types';
```

(Was `'./types'` — stays the same since both files are now in `packages/shared/src/`.)

**Step 6: Move GitHub utilities**

```bash
git mv src/scanner/github.ts packages/shared/src/github.ts
```

No internal import changes needed — this file has no local imports.

**Step 7: Create validation module**

Create `packages/shared/src/validation.ts`:

```typescript
const VALID_NAME = /^[\w.-]+$/;

export function isValidRepoName(name: string): boolean {
  return VALID_NAME.test(name);
}
```

This extracts the owner/repo regex from `backend/src/index.ts:40` and makes it available to both apps.

**Step 8: Commit**

```bash
git add packages/shared/
git commit -m "feat: create @repo/shared package with extracted common code"
```

---

### Task 2: Move frontend to apps/web

**Files:**
- Move: `src/` → `apps/web/src/`
- Move: `public/` → `apps/web/public/`
- Move: `tests/` → `apps/web/tests/`
- Move: `drizzle/` → `apps/web/drizzle/`
- Move: config files → `apps/web/`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`

**Step 1: Create apps/web directory and move source files**

```bash
mkdir -p apps/web
git mv src apps/web/src
git mv public apps/web/public
git mv tests apps/web/tests
git mv drizzle apps/web/drizzle
```

**Step 2: Move config files**

```bash
git mv next.config.ts apps/web/next.config.ts
git mv postcss.config.mjs apps/web/postcss.config.mjs
git mv eslint.config.mjs apps/web/eslint.config.mjs
git mv vitest.config.ts apps/web/vitest.config.ts
git mv drizzle.config.ts apps/web/drizzle.config.ts
git mv next-env.d.ts apps/web/next-env.d.ts 2>/dev/null || true
```

**Step 3: Create `apps/web/package.json`**

```json
{
  "name": "@repo/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "@repo/shared": "workspace:*",
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.0.1",
    "drizzle-kit": "^0.31.10",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vite-tsconfig-paths": "^6.1.1",
    "vitest": "^4.1.2"
  }
}
```

> Note: `@neondatabase/serverless`, `drizzle-orm`, and `tar` are now provided transitively via `@repo/shared`. They're listed in the shared package's `dependencies`.

**Step 4: Create `apps/web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

**Step 5: Update `apps/web/next.config.ts` — add `transpilePackages`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared"],
  async rewrites() {
    return [
      {
        source: '/:owner((?!api|badge|r|_next|opengraph-image|twitter-image|favicon)\\w[\\w.-]*)/:repo([\\w.-]+)',
        destination: '/r/:owner/:repo',
      },
      {
        source: '/:owner((?!api|badge|r|_next|opengraph-image|twitter-image|favicon)\\w[\\w.-]*)/:repo([\\w.-]+)/:rest*',
        destination: '/r/:owner/:repo',
      },
    ];
  },
};

export default nextConfig;
```

**Step 6: Update `apps/web/drizzle.config.ts`**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: '../../packages/shared/src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 7: Delete the old `src/db/` directory stubs (already moved)**

The `src/db/` files were moved in Task 1. Now remove the scanner files that were moved:
- `src/scanner/types.ts` → already moved in Task 1
- `src/scanner/scoring.ts` → already moved in Task 1
- `src/scanner/github.ts` → already moved in Task 1

If `src/scanner/` directory is empty after moves, it won't be. The remaining files are:
- `src/scanner/engine.ts` — stays (frontend-only)
- `src/scanner/run-scan.ts` — stays (frontend-only)
- `src/scanner/checks/` — stays (frontend-only)

These are now at `apps/web/src/scanner/`.

**Step 8: Commit**

```bash
git add apps/web/
git commit -m "refactor: move frontend to apps/web"
```

---

### Task 3: Update frontend imports to use @repo/shared

**Files:**
- Modify: `apps/web/src/app/api/scan/route.ts`
- Modify: `apps/web/src/app/r/[owner]/[repo]/page.tsx`
- Modify: `apps/web/src/scanner/run-scan.ts`
- Modify: `apps/web/src/scanner/engine.ts`
- Modify: `apps/web/src/scanner/checks/*.ts` (any that import types)
- Delete: `apps/web/src/db/` (if still exists — should have been moved)

**Step 1: Update `apps/web/src/app/api/scan/route.ts`**

Change imports:
```typescript
// Before:
import { db } from '@/db';
import { scans } from '@/db/schema';
import { parseGitHubUrl } from '@/scanner/github';

// After:
import { db } from '@repo/shared/db';
import { scans } from '@repo/shared/db/schema';
import { parseGitHubUrl } from '@repo/shared/github';
import { isValidRepoName } from '@repo/shared/validation';
```

Also add owner/repo validation after `parseGitHubUrl` (fixing the security gap):
```typescript
const info = parseGitHubUrl(url);
if (!info) {
  return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
}
if (!isValidRepoName(info.owner) || !isValidRepoName(info.repo)) {
  return NextResponse.json({ error: 'Invalid owner or repo name' }, { status: 400 });
}
```

**Step 2: Update `apps/web/src/scanner/run-scan.ts`**

Change imports:
```typescript
// Before:
import { db } from '@/db';
import { scans, findings as findingsTable } from '@/db/schema';
import { downloadRepo } from './github';
import { calculateScore, getGrade } from './scoring';

// After:
import { db } from '@repo/shared/db';
import { scans, findings as findingsTable } from '@repo/shared/db/schema';
import { downloadRepo } from '@repo/shared/github';
import { calculateScore, getGrade } from '@repo/shared/scoring';
```

Keep `import { scan } from './engine';` and `import { allChecks } from './checks';` as-is (frontend-only).

**Step 3: Update `apps/web/src/scanner/engine.ts`**

Change type import:
```typescript
// Before:
import type { Check, ScanResult } from './types';

// After:
import type { Check, ScanResult } from '@repo/shared/types';
```

**Step 4: Update check files in `apps/web/src/scanner/checks/`**

For each check file that imports `Finding` or `Severity`:
```typescript
// Before:
import type { Finding } from '../types';

// After:
import type { Finding } from '@repo/shared/types';
```

**Step 5: Update `apps/web/src/app/r/[owner]/[repo]/page.tsx`**

Change imports:
```typescript
// Before:
import { db } from '@/db';
import { scans, findings } from '@/db/schema';

// After:
import { db } from '@repo/shared/db';
import { scans, findings } from '@repo/shared/db/schema';
```

**Step 6: Check for any remaining `@/db` imports**

```bash
grep -r "from '@/db" apps/web/src/ --include="*.ts" --include="*.tsx"
grep -r "from '@/scanner/types" apps/web/src/ --include="*.ts" --include="*.tsx"
grep -r "from '@/scanner/scoring" apps/web/src/ --include="*.ts" --include="*.tsx"
grep -r "from '@/scanner/github" apps/web/src/ --include="*.ts" --include="*.tsx"
```

All should return empty. If any remain, update them.

**Step 7: Delete leftover directories**

```bash
rm -rf apps/web/src/db  # if still exists
```

**Step 8: Commit**

```bash
git add apps/web/
git commit -m "refactor: update frontend imports to use @repo/shared"
```

---

### Task 4: Move backend to apps/api

**Files:**
- Move: `backend/` → `apps/api/`
- Modify: `apps/api/package.json`
- Delete: `apps/api/src/db/` (use shared)
- Delete: `apps/api/src/github.ts` (use shared)
- Delete: `apps/api/src/scanners/types.ts` (use shared)
- Delete: `apps/api/packages/` (empty leftover)

**Step 1: Move backend directory**

```bash
git mv backend apps/api
```

**Step 2: Update `apps/api/package.json`**

```json
{
  "name": "@repo/api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "echo 'no build step — tsx runs source directly'",
    "start": "npx tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@hono/node-server": "^1.19.12",
    "@repo/shared": "workspace:*",
    "hono": "^4.12.10",
    "tsx": "^4.21.0"
  },
  "devDependencies": {
    "@types/node": "^25.5.0",
    "typescript": "^5",
    "vitest": "^4.1.2"
  }
}
```

> Removed `@neondatabase/serverless`, `drizzle-orm`, `tar` — now via `@repo/shared`. Downgraded TypeScript to `^5` for consistency (was `^6.0.2`).

**Step 3: Delete duplicated files**

```bash
rm -rf apps/api/src/db
rm apps/api/src/github.ts
rm apps/api/src/scanners/types.ts
rm -rf apps/api/packages
rm apps/api/package-lock.json
```

**Step 4: Clean up backend .gitignore**

Update `apps/api/.gitignore`:
```
node_modules
dist
.env
```

(Remove `docs/plans/` and `.vercel` — not relevant for api.)

**Step 5: Commit**

```bash
git add apps/api/
git commit -m "refactor: move backend to apps/api"
```

---

### Task 5: Update backend imports to use @repo/shared

**Files:**
- Modify: `apps/api/src/scan.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/src/scanners/betterleaks.ts`
- Modify: `apps/api/src/scanners/opengrep.ts`
- Modify: `apps/api/src/scanners/trivy.ts`
- Modify: `apps/api/src/scanners/run-cli.ts`
- Modify: `apps/api/tsconfig.json`

**Step 1: Update `apps/api/src/scan.ts`**

Replace the file — remove duplicated `calculateScore`/`getGrade`, use shared imports:

```typescript
import { db } from '@repo/shared/db';
import { scans, findings as findingsTable } from '@repo/shared/db/schema';
import { eq } from 'drizzle-orm';
import { downloadRepo } from '@repo/shared/github';
import { calculateScore, getGrade } from '@repo/shared/scoring';
import { runBetterleaks } from './scanners/betterleaks';
import { runOpengrep } from './scanners/opengrep';
import { runTrivy } from './scanners/trivy';
import { rm } from 'node:fs/promises';
import type { Finding } from '@repo/shared/types';

export async function runDeepScan(scanId: string, owner: string, repo: string) {
  let dir: string | undefined;

  try {
    await db.update(scans).set({ status: 'scanning' }).where(eq(scans.id, scanId));

    dir = await downloadRepo(owner, repo);

    const [secrets, sast, deps] = await Promise.all([
      runBetterleaks(dir),
      runOpengrep(dir),
      runTrivy(dir),
    ]);

    const allFindings = [...secrets, ...sast, ...deps].map((f) => ({
      ...f,
      file: f.file.startsWith(dir!) ? f.file.slice(dir!.length + 1) : f.file,
    }));
    const score = calculateScore(allFindings);
    const grade = getGrade(score);

    if (allFindings.length > 0) {
      await db.insert(findingsTable).values(
        allFindings.map((f) => ({
          scanId,
          checkName: f.checkName,
          severity: f.severity,
          title: f.title,
          description: f.description,
          file: f.file,
          line: f.line,
        })),
      );
    }

    await db.update(scans).set({
      status: 'complete',
      score,
      grade,
      findingsCount: allFindings.length,
      completedAt: new Date(),
    }).where(eq(scans.id, scanId));
  } catch (error) {
    console.error('Deep scan failed:', error instanceof Error ? error.message : 'Unknown error');
    await db.update(scans).set({ status: 'failed' }).where(eq(scans.id, scanId));
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
```

**Step 2: Update `apps/api/src/index.ts`**

Change validation import:
```typescript
// Before (inline regex):
const validName = /^[\w.-]+$/;
if (!validName.test(owner) || !validName.test(repo)) {

// After:
import { isValidRepoName } from '@repo/shared/validation';
// ...
if (!isValidRepoName(owner) || !isValidRepoName(repo)) {
```

Remove the `const validName = /^[\w.-]+$/;` line.

**Step 3: Update scanner files**

Each scanner file that imports `Finding` from `'../scanners/types'` or `'./types'`:

```typescript
// Before:
import type { Finding } from './types';

// After:
import type { Finding } from '@repo/shared/types';
```

Apply to: `betterleaks.ts`, `opengrep.ts`, `trivy.ts`, `run-cli.ts`

**Step 4: Update `apps/api/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

(No change needed — `moduleResolution: "bundler"` handles workspace imports via pnpm's node_modules linking.)

**Step 5: Verify no old imports remain**

```bash
grep -r "from '\./db" apps/api/src/ --include="*.ts"
grep -r "from '\./github" apps/api/src/ --include="*.ts"
grep -r "from '\./scanners/types" apps/api/src/ --include="*.ts"
grep -r "from '\.\./scanners/types" apps/api/src/ --include="*.ts"
```

All should return empty.

**Step 6: Commit**

```bash
git add apps/api/
git commit -m "refactor: update backend imports to use @repo/shared"
```

---

### Task 6: Update deployment configs

**Files:**
- Modify: `apps/api/Dockerfile`
- Modify: `vercel.json` (root)
- Modify: `.gitignore` (root)
- Modify: `CLAUDE.md`

**Step 1: Update `apps/api/Dockerfile` for monorepo context**

The Dockerfile must be built from the **repo root** so it can access `packages/shared`. Update:

```dockerfile
FROM node:20-slim AS base

RUN apt-get update && apt-get install -y curl tar && rm -rf /var/lib/apt/lists/*

# Install Betterleaks v1.1.1
RUN curl -sSL https://github.com/betterleaks/betterleaks/releases/download/v1.1.1/betterleaks_1.1.1_linux_x64.tar.gz -o /tmp/betterleaks.tar.gz \
    && tar xzf /tmp/betterleaks.tar.gz -C /usr/local/bin betterleaks \
    && chmod +x /usr/local/bin/betterleaks \
    && rm /tmp/betterleaks.tar.gz

# Install Trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Install OpenGrep v1.16.5
RUN curl -sSL https://github.com/opengrep/opengrep/releases/download/v1.16.5/opengrep_manylinux_x86 -o /usr/local/bin/opengrep \
    && chmod +x /usr/local/bin/opengrep

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./

# Copy package.json files for all workspaces (for install)
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

WORKDIR /app/apps/api

EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]
```

> Key change: builds from repo root, copies workspace config + shared package. Railway needs to be configured with **root directory = `/`** (repo root) and the Dockerfile path set to `apps/api/Dockerfile`.

**Step 2: Update root `vercel.json`**

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm turbo build --filter=@repo/web"
}
```

> Vercel root directory should be set to the repo root in the Vercel dashboard, not `apps/web`. Turborepo's `--filter` handles scoping. The `framework: "nextjs"` hint and outputDirectory are auto-detected.

**Important:** In Vercel project settings, set:
- **Root Directory:** leave empty (repo root) OR set to `apps/web`
- If root is repo root: use the build command above
- If root is `apps/web`: change build to `cd ../.. && pnpm turbo build --filter=@repo/web` OR just `next build` (Vercel auto-installs from root)

**Recommended approach:** Set root directory to `apps/web` in Vercel dashboard, set install command to `pnpm install` at root, and let Vercel auto-detect Next.js. The `vercel.json` stays in apps/web:

Move `vercel.json` to `apps/web/vercel.json`:
```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@repo/web"
}
```

**Step 3: Update root `.gitignore`**

```
node_modules
.pnp
.pnp.*

# Next.js
.next/
out/
build/

# Testing
coverage/

# Environment
.env*
!.env.example

# Tool-specific
.claude/
.vercel/
*.tsbuildinfo
next-env.d.ts

# Turbo
.turbo/

# Backend dist
dist/
```

**Step 4: Update `CLAUDE.md`**

Update the Architecture and Backend Deployment sections to reflect monorepo structure. Key changes:
- Frontend is now at `apps/web/`
- Backend is now at `apps/api/`
- Shared package at `packages/shared/`
- Use `pnpm turbo dev` for dev, `pnpm turbo build` for build
- Deploy backend from repo root: `railway up --detach` (with Dockerfile context set to root)

**Step 5: Commit**

```bash
git add apps/api/Dockerfile vercel.json .gitignore CLAUDE.md
git commit -m "chore: update deployment configs for monorepo"
```

---

### Task 7: Add GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo build

      - name: Test
        run: pnpm turbo test

      - name: Lint
        run: pnpm turbo lint
```

> Simple and effective. No deployment — Vercel and Railway handle deploys natively on push. This just gates PRs with build + test + lint.

**Step 2: Commit**

```bash
mkdir -p .github/workflows
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for build, test, lint"
```

---

### Task 8: Install dependencies and verify

**Step 1: Install all dependencies**

```bash
pnpm install
```

This creates the `pnpm-lock.yaml` and links all workspace packages.

**Step 2: Verify builds**

```bash
pnpm turbo build
```

Expected: both `@repo/web` (Next.js build) and `@repo/api` (echo — no build step) succeed.

**Step 3: Run tests**

```bash
pnpm turbo test
```

Expected: all 41 tests pass across both apps.

**Step 4: Verify dev server**

```bash
# In separate terminals:
pnpm turbo dev --filter=@repo/web
pnpm turbo dev --filter=@repo/api
```

Both should start without errors.

**Step 5: Fix any issues**

If tests fail due to import paths, fixture paths, or config issues — fix them. Common issues:
- Test fixture paths may need updating (e.g., `tests/fixtures/` → relative from new location)
- `vite-tsconfig-paths` may need the `root` option updated in vitest.config.ts
- `@repo/shared` imports may need `transpilePackages` in next.config.ts (already added)

**Step 6: Commit lockfile**

```bash
git add pnpm-lock.yaml
git commit -m "chore: add pnpm lockfile"
```

---

### Task 9: Set up multi-environment (Neon branches + docs)

**Step 1: Create Neon database branches**

Using the Neon dashboard or CLI:
- Create `staging` branch from `main` (persistent, long-lived)
- Create `dev` branch from `main` (persistent, long-lived)
- Note connection strings for each

**Step 2: Create `.env.example` at root**

```bash
# Neon Database
DATABASE_URL=postgresql://...

# Scanner Backend (frontend only)
SCANNER_BACKEND_URL=http://localhost:4000

# Scan Secret (shared between frontend and backend)
SCAN_SECRET=your-secret-here
```

**Step 3: Document environment setup**

Create `docs/environments.md`:

```markdown
# Environments

| Env | Frontend | Backend | Database | Branch |
|-----|----------|---------|----------|--------|
| Dev | localhost:3000 | localhost:4000 | Neon `dev` branch | local |
| Preview | Vercel preview | Railway PR env | Neon auto-branch | PR |
| Staging | staging.git.exposed | Railway staging | Neon `staging` branch | `staging` |
| Prod | git.exposed | Railway prod | Neon `main` branch | `main` |

## Env vars per platform

### Vercel (apps/web)
Set per environment in Vercel dashboard:
- `DATABASE_URL` — Neon connection string for the environment
- `SCANNER_BACKEND_URL` — Railway backend URL for the environment
- `SCAN_SECRET` — shared secret

### Railway (apps/api)
Set per environment in Railway dashboard:
- `DATABASE_URL` — Neon connection string for the environment
- `SCAN_SECRET` — shared secret
- `PORT` — 4000
```

**Step 4: Commit**

```bash
git add .env.example docs/environments.md
git commit -m "docs: add multi-environment setup guide"
```

---

### Task 10: Final cleanup and push

**Step 1: Remove leftover files from root**

Check for any orphaned files that should have been moved:
```bash
ls -la *.ts *.mjs *.json 2>/dev/null
```

The only files at root should be:
- `package.json` (root workspace)
- `turbo.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `.npmrc`
- `.gitignore`
- `CLAUDE.md`
- `AGENTS.md`

Remove any leftover config files:
```bash
# These should have been moved already, but verify:
rm -f next.config.ts postcss.config.mjs eslint.config.mjs vitest.config.ts drizzle.config.ts tsconfig.json next-env.d.ts
```

**Step 2: Verify final structure**

```bash
tree -L 3 -I 'node_modules|.next|.git|dist|.turbo'
```

Expected:
```
.
├── .github/workflows/ci.yml
├── .gitignore
├── .npmrc
├── AGENTS.md
├── CLAUDE.md
├── apps/
│   ├── api/
│   │   ├── .gitignore
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── src/
│   │   ├── tests/
│   │   └── tsconfig.json
│   └── web/
│       ├── drizzle/
│       ├── drizzle.config.ts
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── public/
│       ├── src/
│       ├── tests/
│       ├── tsconfig.json
│       ├── vercel.json
│       └── vitest.config.ts
├── docs/
│   └── environments.md
├── package.json
├── packages/
│   └── shared/
│       ├── package.json
│       ├── src/
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

**Step 3: Run full verification**

```bash
pnpm turbo build test lint
```

All must pass.

**Step 4: Final commit and push**

```bash
git add -A
git status  # verify nothing unexpected
git commit -m "chore: complete monorepo migration"
git push
```

**Step 5: Update Vercel project settings**

In Vercel dashboard for `davidstrouks-projects/git-exposed`:
- Set **Root Directory** to `apps/web`
- Set **Install Command** to `cd ../.. && pnpm install`
- Set **Build Command** to `cd ../.. && pnpm turbo build --filter=@repo/web`
- Verify env vars are still set

**Step 6: Update Railway project settings**

In Railway dashboard:
- Set **Root Directory** to repo root (empty or `/`)
- Set **Dockerfile Path** to `apps/api/Dockerfile`
- Set **Watch Paths** to `apps/api/**` and `packages/shared/**`
- Verify env vars are still set

---

## Post-Migration Checklist

- [ ] `pnpm turbo build` succeeds
- [ ] `pnpm turbo test` — all 41 tests pass
- [ ] `pnpm turbo lint` passes
- [ ] Frontend dev server starts (`pnpm dev --filter=@repo/web`)
- [ ] Backend dev server starts (`pnpm dev --filter=@repo/api`)
- [ ] Vercel preview deploy works on PR
- [ ] Railway deploy works
- [ ] GitHub Actions CI runs on PR
- [ ] Neon staging branch created
