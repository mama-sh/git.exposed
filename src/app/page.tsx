'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }

      // Poll for completion
      const poll = setInterval(async () => {
        const status = await fetch(`/api/scan/${data.id}`).then(r => r.json());
        if (status.status === 'complete') {
          clearInterval(poll);
          router.push(data.reportUrl);
        } else if (status.status === 'failed') {
          clearInterval(poll);
          setError('Scan failed. Is this a valid public repository?');
          setLoading(false);
        }
      }, 1000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center px-6">
      <main className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          git.<span className="text-red-500">exposed</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10">
          Is your code exposed? Scan any public GitHub repo in seconds.
        </p>

        <form onSubmit={handleScan} className="flex gap-3 mb-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <p className="text-sm text-slate-500">
          Free &middot; Open source &middot; No signup required
        </p>
      </main>
    </div>
  );
}
