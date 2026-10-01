'use client';

// Replaces the Vite app's top-level ErrorBoundary.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-xl font-semibold text-gray-900">發生錯誤</h1>
        <p className="mt-2 text-sm text-gray-600">這個頁面遇到問題，請再試一次。</p>
        {/* Dev only: messages can carry API responses and other internals. */}
        {process.env.NODE_ENV === 'development' ? (
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-3 text-left text-xs text-gray-800">{error.message || String(error)}</pre>
        ) : null}
        <button type="button" onClick={() => retry()} className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
          重試
        </button>
      </div>
    </div>
  );
}
