import Link from "next/link";

export default function ComplaintsDisputeResolutionPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-[#1a1816]">
        Complaints &amp; Dispute Resolution
      </h1>
      <p className="mt-4 text-sm text-gray-600">
        This page explains how to raise concerns about AI-assisted listings,
        moderation decisions, and other platform actions.
      </p>
      <div className="mt-8 rounded-xl border border-[#e8dfd0] bg-[#fffaf2] p-4 text-sm text-gray-700">
        <p className="font-semibold text-[#1a1816]">What you can do</p>
        <ul className="mt-3 space-y-2">
          <li>Use the AI suggestion feedback buttons on the Sell page.</li>
          <li>Open the AI policy page to review how AI is used.</li>
          <li>Contact support with the listing request ID if you want a manual review.</li>
        </ul>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        You can also review the{" "}
        <Link href="/ai-policy" className="text-[#cb6f4d] underline">
          AI Features &amp; Disclosure Policy
        </Link>{" "}
        for more context.
      </p>
    </main>
  );
}
