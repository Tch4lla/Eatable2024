import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents refetching when window regains focus
      staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Garbage collection time (formerly cacheTime)
      retry: 1, // Only retry failed requests once
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
