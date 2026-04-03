import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

export interface RepoInfo {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(url: string): RepoInfo | null {
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return null;
    const parts = u.pathname.replace(/\.git$/, '').split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

export async function downloadRepo(owner: string, repo: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'gitexposed-'));
  const tarballUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.tar.gz`;

  try {
    execSync(
      `curl -sL "${tarballUrl}" | tar xz --strip-components=1 -C "${dir}"`,
      { timeout: 30000 },
    );
  } catch {
    // Try 'master' branch if 'main' fails
    const masterUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.tar.gz`;
    execSync(
      `curl -sL "${masterUrl}" | tar xz --strip-components=1 -C "${dir}"`,
      { timeout: 30000 },
    );
  }

  return dir;
}
