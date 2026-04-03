import { mkdtemp, writeFile } from 'node:fs/promises';
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

async function fetchTarball(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function downloadRepo(owner: string, repo: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'gitexposed-'));
  const tarPath = path.join(dir, 'repo.tar.gz');

  let buffer: Buffer;
  try {
    buffer = await fetchTarball(`https://github.com/${owner}/${repo}/archive/refs/heads/main.tar.gz`);
  } catch {
    buffer = await fetchTarball(`https://github.com/${owner}/${repo}/archive/refs/heads/master.tar.gz`);
  }

  await writeFile(tarPath, buffer);
  execSync(`tar xzf "${tarPath}" --strip-components=1 -C "${dir}"`, { timeout: 15000 });

  return dir;
}
