/** Cloudflare Worker entry point for the React single-page application. */
interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const PRIMARY_HOST = "march7th.moe";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 只规范已知正式域名，避免本地、Workers 和 Codex 预览被重定向。
    if (
      url.hostname === `www.${PRIMARY_HOST}` ||
      (url.hostname === PRIMARY_HOST && url.protocol === "http:")
    ) {
      url.hostname = PRIMARY_HOST;
      url.protocol = "https:";
      return Response.redirect(url, 301);
    }

    // 静态资源和 404 页面状态由 wrangler.jsonc 统一配置。
    return env.ASSETS.fetch(request);
  },
};
