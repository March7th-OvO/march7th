import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig(async ({ command, isPreview }) => {
  const usesCloudflareRuntime = command === "build" || isPreview;
  let cloudflarePlugin = null;

  if (usesCloudflareRuntime) {
    // Wrangler snapshots its log path while the Cloudflare plugin is imported.
    process.env.WRANGLER_WRITE_LOGS ??= "false";
    process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
    process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

    const { cloudflare } = await import("@cloudflare/vite-plugin");
    cloudflarePlugin = cloudflare({ inspectorPort: false });
  }

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    // Development uses Vite's native React server; build/preview adds Workers.
    plugins: [
      react(),
      sites(),
      ...(cloudflarePlugin ? [cloudflarePlugin] : []),
    ],
  };
});
