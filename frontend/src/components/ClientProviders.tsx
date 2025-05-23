"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </ClerkProvider>
  );
}
