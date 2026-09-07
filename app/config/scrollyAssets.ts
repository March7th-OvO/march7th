/** 相对素材路径以 Vite BASE_URL 为根；绝对路径和 HTTP(S) CDN 地址保持原样。 */
export function resolveScrollyAssetSrc(src: string, baseUrl = import.meta.env.BASE_URL) {
  if (!src || src.startsWith("/") || /^https?:\/\//i.test(src)) return src;
  return `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}${src.replace(/^\.\//, "")}`;
}
