'use client';

import { startTransition, addTransitionType } from 'react';
import { useRouter } from 'next/navigation';

export function BackLink() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        startTransition(() => {
          addTransitionType('nav-back');
          router.push('/');
        });
      }}
      className="text-red-500 hover:text-red-400 font-semibold text-sm"
    >
      Scan another repo &rarr;
    </button>
  );
}
