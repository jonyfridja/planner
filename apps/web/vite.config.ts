import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // Served at projects.jonyfridja.com/planner in production (path-routed through a
  // shared Cloudflare Tunnel alongside other apps on the same domain), but at the
  // dev server root locally — keep dev URLs/proxying unchanged.
  base: command === "build" ? "/planner/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
}));
