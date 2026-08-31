import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./forms-accordion.css";
import "./hero-photo.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("React root element #root was not found.");
}

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// 生产构建会预渲染首页；开发环境仍从空容器正常挂载。
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
