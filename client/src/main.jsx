import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { MantineProvider } from "@mantine/core";
import { Toaster } from "react-hot-toast";
import "./i18n.js";
import "@mantine/core/styles.css";
import "./index.css";
import { Suspense } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: 5000,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark">
        <Suspense fallback={"Loading..."}>
          <App />
        </Suspense>
        <Toaster position="top-right" />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
