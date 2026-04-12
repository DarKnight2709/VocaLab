import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    css: {
      postcss: { plugins: [] },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
