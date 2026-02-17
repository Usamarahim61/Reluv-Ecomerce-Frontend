"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return <Provider store={store}>{children}</Provider>;
}
