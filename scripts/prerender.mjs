import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { createElement, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const outputPath = resolve("dist/client/index.html");
const rootMarker = '<div id="root"></div>';

// 复用 Vite 的转换能力加载 TSX，避免维护第二套 SSR 打包配置。
const vite = await createServer({
  appType: "custom",
  configFile: false,
  plugins: [react()],
  server: { middlewareMode: true },
});

try {
  const [{ default: App }, document] = await Promise.all([
    vite.ssrLoadModule("/app/App.tsx"),
    readFile(outputPath, "utf8"),
  ]);

  if (!document.includes(rootMarker)) {
    throw new Error(
      `Unable to prerender: ${outputPath} does not contain ${rootMarker}.`,
    );
  }

  const appHtml = renderToString(
    createElement(StrictMode, null, createElement(App)),
  );

  await writeFile(
    outputPath,
    document.replace(rootMarker, `<div id="root">${appHtml}</div>`),
    "utf8",
  );

  console.log(`Prerendered React content into ${outputPath}.`);
} finally {
  await vite.close();
}
