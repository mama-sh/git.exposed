import { describe, it, expect } from 'vitest';
import { scans, findings, fixJobs, monitoredRepos } from '@repo/shared/db/schema';

describe('database schema', () => {
  it('scans table has required columns', () => {
    const columns = Object.keys(scans);
    expect(columns).toContain('id');
    expect(columns).toContain('repoOwner');
    expect(columns).toContain('repoName');
    expect(columns).toContain('repoUrl');
    expect(columns).toContain('status');
    expect(columns).toContain('score');
    expect(columns).toContain('grade');
    expect(columns).toContain('findingsCount');
    expect(columns).toContain('createdAt');
  });

  it('findings table has required columns', () => {
    const columns = Object.keys(findings);
    expect(columns).toContain('id');
    expect(columns).toContain('scanId');
    expect(columns).toContain('severity');
    expect(columns).toContain('title');
    expect(columns).toContain('description');
    expect(columns).toContain('file');
    expect(columns).toContain('line');
    expect(columns).toContain('checkName');
  });

  it('fixJobs table has required columns', () => {
    const columns = Object.keys(fixJobs);
    expect(columns).toContain('id');
    expect(columns).toContain('scanId');
    expect(columns).toContain('userId');
    expect(columns).toContain('findingIds');
    expect(columns).toContain('status');
    expect(columns).toContain('prUrl');
    expect(columns).toContain('error');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('completedAt');
  });

  it('monitoredRepos table has required columns', () => {
    const columns = Object.keys(monitoredRepos);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('repoOwner');
    expect(columns).toContain('repoName');
    expect(columns).toContain('webhookId');
    expect(columns).toContain('createdAt');
  });
});
