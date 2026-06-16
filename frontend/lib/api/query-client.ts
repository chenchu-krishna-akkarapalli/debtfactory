import { QueryClient } from "@tanstack/react-query";

/** Shared React Query defaults: short stale window, no refetch-on-focus (live form drives it). */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        refetchOnWindowFocus: false,
        gcTime: 60_000,
      },
    },
  });
}
