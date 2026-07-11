import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./index.css";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

const umamiSrc = import.meta.env.VITE_UMAMI_SRC;
const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
if (umamiSrc && umamiWebsiteId) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = umamiSrc;
  script.setAttribute("data-website-id", umamiWebsiteId);
  // The SPA route-change tracking in App.tsx sends its own pageviews, so let it
  // own the initial load too rather than double-counting it here.
  script.setAttribute("data-auto-track", "false");
  document.head.appendChild(script);
}

const queryClient = new QueryClient();

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Routes>
            <Route path="/tasks/:taskId" element={<App />} />
            <Route path="/" element={<App />} />
          </Routes>
        </BrowserRouter>
      </PrimeReactProvider>
    </QueryClientProvider>
  </StrictMode>,
);
