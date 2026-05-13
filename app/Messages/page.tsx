import { Suspense } from "react";
import MessagesClient from "./MessagesClient";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-sm text-gray-500">
          Loading messages...
        </div>
      }
    >
      <MessagesClient />
    </Suspense>
  );
}
