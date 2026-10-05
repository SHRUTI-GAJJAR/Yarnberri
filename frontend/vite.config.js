import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // shadcn/ui writes every generated file as `@/components/...`,
      // `@/lib/utils`, etc. `package.json` sets "type": "module", so
      // __dirname is unavailable and import.meta.url has to be used instead.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
