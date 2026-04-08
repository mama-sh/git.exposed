'use client';

import { Download, GitBranch, Package, ScanSearch, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const SCAN_PHASES = [
  { label: 'Connecting to GitHub', icon: GitBranch },
  { label: 'Downloading repository', icon: Download },
  { label: 'Scanning for secrets', icon: ScanSearch },
  { label: 'Analyzing dependencies', icon: Package },
  { label: 'Running security checks', icon: ShieldCheck },
];

const PHASE_INTERVAL = 3000;
const POLL_INTERVAL = 2000;

interface AutoScanProps {
  owner: string;
  repo: string;
}

export function AutoScan({ owner, repo }: AutoScanProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [error, setError] = useState('');
  const [scanComplete, setScanComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const router = useRouter();
  const hasStarted = useRef(false);

  // Timer
  useEffect(() => {
    if (scanComplete || error) return;
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [scanComplete, error]);

  // Advance through scan phases
  useEffect(() => {
    if (scanComplete || error) return;
    const timer = setInterval(() => {
      setCurrentPhase((prev) => (prev >= SCAN_PHASES.length - 1 ? prev : prev + 1));
    }, PHASE_INTERVAL);
    return () => clearInterval(timer);
  }, [scanComplete, error]);

  const onComplete = useCallback(() => {
    setScanComplete(true);
    setCurrentPhase(SCAN_PHASES.length);
    setTimeout(() => router.refresh(), 600);
  }, [router]);

  // Poll for scan completion
  useEffect(() => {
    if (!scanId || scanComplete || error) return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/${scanId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'complete') {
          clearInterval(poll);
          onComplete();
        } else if (data.status === 'failed') {
          clearInterval(poll);
          setError('Scan failed. Is this a valid repository?');
        }
      } catch {
        // Retry on next interval
      }
    }, POLL_INTERVAL);

    return () => clearInterval(poll);
  }, [scanId, scanComplete, error, onComplete]);

  // Trigger scan on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    (async () => {
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: `https://github.com/${owner}/${repo}` }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Scan failed');
          return;
        }

        if (data.status === 'complete') {
          // Already had a cached result
          onComplete();
        } else if (data.id) {
          // Scan started — poll for completion
          setScanId(data.id);
        } else {
          setError('Scan failed. Is this a valid repository?');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      }
    })();
  }, [owner, repo, onComplete]);

  const progress = scanComplete ? 100 : Math.min(95, (currentPhase / SCAN_PHASES.length) * 85 + 10);

  return (
    <div className="text-center pt-8">
      {/* Repo identifier */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ds-border/30 bg-ds-muted/40 mb-10">
        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
        <span className="text-sm text-slate-300 font-mono">
          {owner}/{repo}
        </span>
      </div>

      {error ? (
        <div className="max-w-md mx-auto">
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-8 mb-6">
            <div className="w-12 h-12 rounded-full border-2 border-red-500/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">&#x2715;</span>
            </div>
            <p className="text-red-400 text-sm mb-1 font-medium">Scan failed</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
          <Link href="/" className="text-red-500 hover:text-red-400 font-semibold text-sm transition-colors">
            &larr; Try a different repo
          </Link>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {/* Central scanner visualization */}
          <div className="relative mb-10">
            <div className="relative w-32 h-32 mx-auto">
              {/* Outer ring — rotating */}
              <svg
                className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  className="text-ds-border/20"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              </svg>

              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  className="text-ds-border/10"
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#scan-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.51} ${251 - progress * 2.51}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {scanComplete ? (
                  <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Phase list */}
          <div className="space-y-2 text-left mb-8">
            {SCAN_PHASES.map((phase, i) => {
              const isComplete = i < currentPhase || scanComplete;
              const isCurrent = i === currentPhase && !scanComplete;

              return (
                <div
                  key={phase.label}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 border',
                    isCurrent && 'bg-red-500/5 border-red-500/15',
                    isComplete && 'bg-green-500/5 border-transparent',
                    !isCurrent && !isComplete && 'border-transparent opacity-40',
                  )}
                >
                  <span className="w-6 h-6 flex items-center justify-center shrink-0">
                    {isComplete ? (
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isCurrent ? (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    )}
                  </span>
                  <phase.icon
                    className={cn(
                      'w-3.5 h-3.5 shrink-0',
                      isCurrent ? 'text-red-400' : isComplete ? 'text-green-500/60' : 'text-slate-600',
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      isComplete && 'text-slate-400',
                      isCurrent && 'text-slate-200',
                      !isCurrent && !isComplete && 'text-slate-500',
                    )}
                  >
                    {phase.label}
                    {isCurrent && <span className="animate-pulse">...</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer status */}
          {scanComplete ? (
            <div className="flex items-center justify-center gap-2 text-green-500 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Loading results...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="font-mono tabular-nums">{elapsed}s elapsed</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>Usually takes 10–30s</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
