/** Cloudflare Worker entry point for the React single-page application. */
interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    // SPA fallback and static asset handling are configured in wrangler.jsonc.
    return env.ASSETS.fetch(request);
  },
};
