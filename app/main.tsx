import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./forms-accordion.css";
import "./hero-photo.css";
import "./space-photo-wall.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("React root element #root was not found.");
}

const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
const app = (
  <StrictMode>
    <App pathname={pathname} />
  </StrictMode>
);

// 生产构建只预渲染首页；访问子页面时清除首页 HTML 后再独立挂载。
if (rootElement.hasChildNodes() && pathname === "/") {
  hydrateRoot(rootElement, app);
} else {
  if (rootElement.hasChildNodes()) rootElement.replaceChildren();
  createRoot(rootElement).render(app);
}
