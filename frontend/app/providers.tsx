"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { makeQueryClient } from "@/lib/api/query-client";

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session (lazy init so it isn't shared across requests).
  const [queryClient] = useState(makeQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
