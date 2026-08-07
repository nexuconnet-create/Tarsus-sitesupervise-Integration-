'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[#021422]">Something went wrong</h2>
      <p className="text-sm text-gray-500 text-center max-w-sm">
        An unexpected error occurred. You can try again or return to sign in.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={reset}
          className="px-5 py-2 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-[#033a66] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/signin"
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
