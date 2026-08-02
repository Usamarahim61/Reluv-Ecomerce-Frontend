export default function MaintenanceScreen({
  message,
}: {
  message: string | null;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF5EF] px-6 py-16">
      {/* faint diagonal stitch texture, barely-there */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #2A2420 0px, #2A2420 1px, transparent 1px, transparent 14px)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm -rotate-1">
        {/* thread loop + punch hole */}
        <div className="relative z-10 flex justify-center">
          <svg
            width="64"
            height="40"
            viewBox="0 0 64 40"
            className="text-[#cb6f4d]"
            aria-hidden="true"
          >
            <path
              d="M14 34 Q32 -6 50 34"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="32"
              cy="30"
              r="6"
              fill="#FAF5EF"
              stroke="#2A2420"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* the tag itself */}
        <div
          className="relative -mt-2 rounded-[4px] bg-white px-8 py-10 text-center"
          style={{
            border: "1.5px dashed #d9c9b8",
            boxShadow: "0 12px 30px -12px rgba(42,36,32,0.18)",
          }}
        >
          <p
            className="text-[11px] font-medium tracking-[0.2em] text-[#cb6f4d] uppercase"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Mending in progress
          </p>

          <p
            className="mt-3 text-3xl leading-none text-[#2A2420]"
            style={{ fontFamily: "var(--font-great-vibes)" }}
          >
            reluv
          </p>

          {/* animated stitch divider */}
          <svg
            width="140"
            height="14"
            viewBox="0 0 140 14"
            className="mx-auto my-5 text-[#7C8363]"
            aria-hidden="true"
          >
            <path
              d="M2 7 Q35 -2 70 7 T138 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
              className="motion-safe:animate-[stitch_3s_linear_infinite]"
            />
          </svg>

          <h1
            className="text-xl font-medium text-[#2A2420]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            We&apos;ll be right back on the rack
          </h1>

          <p
            className="mt-3 text-sm leading-relaxed text-[#8A7F6F]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {message ||
              "We're patching a few things up behind the scenes. Reluv will be back shortly."}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes stitch {
          to { stroke-dashoffset: -22; }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[stitch_3s_linear_infinite\\] {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}