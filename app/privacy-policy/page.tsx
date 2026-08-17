import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-[#1a1816]">Privacy Policy</h1>
      <p className="mt-4 text-sm text-gray-600">
        This page will host RELove&apos;s approved Privacy Policy text.
      </p>
      <p className="mt-3 text-sm text-gray-600">
        In the meantime, please review the{" "}
        <Link href="/ai-policy" className="text-[#cb6f4d] underline">
          AI Features &amp; Disclosure Policy
        </Link>{" "}
        and the{" "}
        <Link href="/help" className="text-[#cb6f4d] underline">
          Help Centre
        </Link>
        .
      </p>
      <p id="cookies" className="mt-8 text-xs text-gray-400">
        Cookie preferences and related controls will be added here once the final policy copy is published.
      </p>
    </main>
  );
}
