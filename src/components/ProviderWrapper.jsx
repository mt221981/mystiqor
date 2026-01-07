
import { ThemeProvider } from "./ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import CacheBuster from './CacheBuster';
import GlobalErrorBoundary from './GlobalErrorBoundary'; // Assuming GlobalErrorBoundary is a local component

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function ProviderWrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CacheBuster />
      <GlobalErrorBoundary>
        <ThemeProvider>
          <Toaster position="top-center" richColors closeButton />
          {children}
        </ThemeProvider>
      </GlobalErrorBoundary>
    </QueryClientProvider>
  );
}
