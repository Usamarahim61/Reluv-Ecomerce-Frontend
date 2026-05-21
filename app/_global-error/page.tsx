"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html>
      <body className="bg-white text-slate-900">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          
          <h1 className="text-4xl font-bold text-[#cb6f4d] mb-4">
            Something went wrong
          </h1>

          <p className="text-slate-600 max-w-md mb-6">
            An unexpected error occurred while loading this page.
          </p>

          <button
            onClick={() => reset()}
            className="bg-[#cb6f4d] text-white px-6 py-3 rounded-lg hover:bg-[#b85f3e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}