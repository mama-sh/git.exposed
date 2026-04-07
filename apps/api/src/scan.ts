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
    console.log(`[scan] Starting deep scan for ${owner}/${repo} (${scanId})`);
    await db.update(scans).set({ status: 'scanning' }).where(eq(scans.id, scanId));

    dir = await downloadRepo(owner, repo);
    console.log(`[scan] Downloaded ${owner}/${repo} to ${dir}`);

    // Run all three scanners concurrently (async exec, non-blocking)
    const [secrets, sast, deps] = await Promise.all([
      runBetterleaks(dir).then(r => { console.log(`[scan] Betterleaks: ${r.length} findings`); return r; }),
      runOpengrep(dir).then(r => { console.log(`[scan] OpenGrep: ${r.length} findings`); return r; }),
      runTrivy(dir).then(r => { console.log(`[scan] Trivy: ${r.length} findings`); return r; }),
    ]);

    const allFindings = [...secrets, ...sast, ...deps].map((f) => ({
      ...f,
      // Strip temp directory prefix — show repo-relative paths
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

    console.log(`[scan] Complete: ${owner}/${repo} — ${allFindings.length} findings, score=${score}, grade=${grade}`);

    await db.update(scans).set({
      status: 'complete',
      score,
      grade,
      findingsCount: allFindings.length,
      completedAt: new Date(),
    }).where(eq(scans.id, scanId));
  } catch (error) {
    console.error(`[scan] FAILED: ${owner}/${repo} —`, error instanceof Error ? error.message : 'Unknown error');
    await db.update(scans).set({ status: 'failed' }).where(eq(scans.id, scanId));
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
