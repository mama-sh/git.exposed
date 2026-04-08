import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared"],
  experimental: { viewTransition: true },
  // Poll for file changes every 300ms so Turbopack picks up files
  // written by the external fswatch watcher (FSEvents alone is unreliable
  // for files modified by an external process like cp).
  watchOptions: { pollIntervalMs: 300 },
  async rewrites() {
    return [
      // git.exposed/owner/repo → internal /r/owner/repo
      // Exclude known routes: api, badge, r, _next, opengraph-image, twitter-image, favicon
      {
        source: '/:owner((?!api|badge|r|_next|opengraph-image|twitter-image|favicon)\\w[\\w.-]*)/:repo([\\w.-]+)',
        destination: '/r/:owner/:repo',
      },
      // Also handle GitHub-style deep paths: owner/repo/tree/main/src → owner/repo
      {
        source: '/:owner((?!api|badge|r|_next|opengraph-image|twitter-image|favicon)\\w[\\w.-]*)/:repo([\\w.-]+)/:rest*',
        destination: '/r/:owner/:repo',
      },
    ];
  },
};

export default nextConfig;
