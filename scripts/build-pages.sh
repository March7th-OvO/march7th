#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"
pages_dir="${project_root}/dist/pages"
client_dir="${project_root}/dist/client"
pages_entry="${project_root}/worker/pages.ts"

# 先生成 Vinext 的 Worker 与静态资源，再按 Pages Advanced Mode 的目录约定组装产物。
"${script_dir}/build-verified.sh"

# Vinext 会为 Workers 部署生成 Wrangler 重定向配置；Pages 命令必须读取根目录配置。
rm -f "${project_root}/.wrangler/deploy/config.json"

mkdir -p "${pages_dir}"
cp -R "${client_dir}/." "${pages_dir}/"

# Pages 的 `_worker.js` 必须是单文件 Worker；将 Vinext 的服务端入口及其动态分块一并打包。
"${project_root}/node_modules/.bin/esbuild" \
  "${pages_entry}" \
  --bundle \
  --format=esm \
  --platform=browser \
  --target=es2022 \
  --external:node:* \
  --outfile="${pages_dir}/_worker.js"

test -f "${pages_dir}/_worker.js"
test -f "${pages_dir}/train-group.webp"

echo "Cloudflare Pages output is ready at dist/pages."
