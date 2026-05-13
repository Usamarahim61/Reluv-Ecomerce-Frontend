// Add these props types at the top of Skeletons.tsx
interface ProductGridSkeletonProps {
  wrapper?: string;
  grid?: string;
}

interface ProductGridErrorProps {
  wrapper?: string;
  error?: string;
  onRetry?: () => void;
}

interface ProductGridEmptyProps {
  wrapper?: string;
}

export function ProductGridError({
  wrapper = "",
  error,
  onRetry,
}: ProductGridErrorProps) {
  return (
    <section className={wrapper}>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 py-14 text-center">
        <span className="mb-3 text-5xl">😕</span>
        <h2 className="mb-1 text-[18px] font-semibold text-red-700">
          Something went wrong
        </h2>
        <p className="mb-5 max-w-sm text-[14px] text-red-500">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-full bg-[#cb6f4d] px-6 py-2 text-[14px] font-medium text-white transition hover:bg-[#005f6a]"
          >
            Try again
          </button>
        )}
      </div>
    </section>
  );
}

export function ProductGridSkeleton({
  wrapper = "max-w-7xl mx-auto px-4 py-6",
  grid = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10",
}: ProductGridSkeletonProps) {
  return (
    <section className={wrapper}>
      <div className={grid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-2 aspect-[3/4] w-full rounded-xl bg-gray-200" />
            <div className="mb-1.5 h-3 w-3/4 rounded bg-gray-200" />
            <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-1/3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductGridEmpty({ wrapper = "" }: ProductGridEmptyProps) {
  return (
    <section className={wrapper}>
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-4 text-6xl">🛍️</span>
        <h2 className="mb-2 text-[20px] font-semibold text-[#1d1d1d]">
          No items found
        </h2>
        <p className="max-w-sm text-[14px] text-[#6f6f6f]">
          We couldn&apos;t find anything matching your filters. Try adjusting or
          clearing them to see more results.
        </p>
      </div>
    </section>
  );
}
export function NavbarSkeleton() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2">
          <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-0 w-[750px]">
            <div className="hidden sm:flex">
              <div className="h-9 w-36 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="hidden sm:flex flex-1 h-9 animate-pulse rounded-md bg-gray-200" />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            <div className="hidden sm:block h-8 w-28 animate-pulse rounded bg-gray-200" />
            <div className="hidden sm:block h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="hidden sm:block h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            <div className="hidden sm:block h-8 w-10 animate-pulse rounded bg-gray-200" />
            <div className="sm:hidden h-9 w-9 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="hidden sm:block max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 py-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-3 w-16 animate-pulse rounded bg-gray-200"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function HomeSkeleton() {
  return (
    // <div className="min-h-screen flex flex-col">
    <div className=" flex flex-col">
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-gray-200 overflow-hidden animate-pulse">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      md:left-20 md:translate-x-0 
                      bg-white p-6 md:p-10 rounded-lg shadow-xl 
                      w-[90%] max-w-[350px] md:max-w-sm space-y-4"
        >
          <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-11 w-full animate-pulse rounded-md bg-gray-200" />
          <div className="h-3 w-28 mx-auto animate-pulse rounded bg-gray-200" />
        </div>
      </section>
      {/* <section className="max-w-7xl mx-auto w-full px-4 py-4 md:py-6">
        <div className="flex justify-between items-center border border-gray-100 rounded-sm p-3 md:p-4 mb-4 md:mb-8 bg-white shadow-sm">
          <div className="h-3 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
        </div>
      </section> */}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] pb-14 pt-4">
      <div className="mx-auto w-full max-w-320 px-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3 w-10 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-3 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-3 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-3">
            <div className="rounded-sm p-2">
              <div className="grid min-h-[540px] grid-cols-1 gap-2 sm:grid-cols-4">
                <div className="animate-pulse rounded-md bg-gray-200 sm:col-span-2 sm:row-span-2" />
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-md bg-gray-200 sm:col-span-1"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pr-1">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            </div>
            <section className="space-y-3 pt-1">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="mb-2 aspect-[3/4] w-full rounded-xl bg-gray-200" />
                    <div className="mb-1.5 h-3 w-3/4 rounded bg-gray-200" />
                    <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-3 pt-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="mb-2 aspect-[3/4] w-full rounded-xl bg-gray-200" />
                    <div className="mb-1.5 h-3 w-3/4 rounded bg-gray-200" />
                    <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </section>
          </section>
          <aside className="space-y-3">
            <div className="rounded-sm border border-[#e3e3e3] bg-white p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="border-b border-[#ececec] pb-3 space-y-1.5">
                <div className="h-7 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="rounded-sm bg-[#f7f7f7] p-2 space-y-2">
                <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="h-3 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-b border-[#ececec] pb-3">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-9 w-full animate-pulse rounded-[4px] bg-gray-200" />
                <div className="h-9 w-full animate-pulse rounded-[4px] bg-gray-200" />
              </div>
            </div>
            <div className="flex gap-3 rounded-sm border border-[#e3e3e3] bg-white p-3">
              <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="rounded-sm border border-[#e3e3e3] bg-white">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="border-y border-[#f0f0f0] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-md bg-gray-200" />
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-36 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
export function ProductErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center px-4">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-8 py-14 text-center max-w-sm w-full">
        <span className="mb-3 text-5xl">😕</span>
        <h2 className="mb-1 text-[18px] font-semibold text-red-700">
          Something went wrong
        </h2>
        <p className="mb-5 text-[14px] text-red-500">{message}</p>
        <button
          onClick={onRetry}
          className="rounded-full bg-[#cb6f4d] px-6 py-2 text-[14px] font-medium text-white transition hover:bg-[#005f6a]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
