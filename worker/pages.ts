/** Cloudflare Pages Advanced Mode entry point. */
import handler from "../dist/server/index.js";

interface PagesEnv {
  ASSETS: {
    fetch(request: Request): Promise<Response> | Response;
  };
}

interface PagesExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const pagesWorker = {
  async fetch(
    request: Request,
    env: PagesEnv,
    ctx: PagesExecutionContext,
  ): Promise<Response> {
    const { pathname } = new URL(request.url);

    // Pages Advanced Mode owns every request, so Vite's hashed client assets
    // must bypass the Vinext router and be served by the built-in ASSETS binding.
    if (pathname === "/assets" || pathname.startsWith("/assets/")) {
      return env.ASSETS.fetch(request);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default pagesWorker;
