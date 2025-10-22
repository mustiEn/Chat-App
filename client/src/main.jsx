import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "@mantine/core/styles.css";
import "./index.css";

import { MantineProvider } from "@mantine/core";
import { Toaster } from "react-hot-toast";

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
        <App />
        <Toaster position="top-right" />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
