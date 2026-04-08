'use client';

import { useRouter } from 'next/navigation';
import { addTransitionType, startTransition } from 'react';

export function BackLink() {
  const router = useRouter();

  return (
    <button
      type="button"
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
