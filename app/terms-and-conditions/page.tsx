import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-[#1a1816]">Terms &amp; Conditions</h1>
      <p className="mt-4 text-sm text-gray-600">
        This page will host RELove&apos;s approved Terms &amp; Conditions text.
      </p>
      <p className="mt-3 text-sm text-gray-600">
        For platform disclosures about AI, please see the{" "}
        <Link href="/ai-policy" className="text-[#cb6f4d] underline">
          AI Features &amp; Disclosure Policy
        </Link>
        .
      </p>
      <p className="mt-3 text-sm text-gray-600">
        If you need help right away, visit the{" "}
        <Link href="/help" className="text-[#cb6f4d] underline">
          Help Centre
        </Link>
        .
      </p>
    </main>
  );
}
