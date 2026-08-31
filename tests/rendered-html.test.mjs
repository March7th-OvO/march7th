import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const clientUrl = new URL("../dist/client/", import.meta.url);

test("prerenders meaningful React content into the entry document", async () => {
  const html = await readFile(new URL("index.html", clientUrl), "utf8");

  assert.doesNotMatch(html, /<div id="root"><\/div>/);
  assert.match(html, /<div id="root">[\s\S]*<main>/);
  assert.match(html, /把今天，/);
  assert.match(html, /角色档案/);
  assert.match(html, /type="module"[^>]+src="\/assets\/index-[^"]+\.js"/);
});

test("emits canonical, social and structured metadata", async () => {
  const html = await readFile(new URL("index.html", clientUrl), "utf8");
  const jsonLdSource = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];

  assert.match(
    html,
    /<title>三月七角色纪念站｜崩坏：星穹铁道 March 7th<\/title>/,
  );
  assert.match(html, /<link rel="canonical" href="https:\/\/march7th\.moe\/"\s*\/?>/);
  assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large"\s*\/?>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/march7th\.moe\/"\s*\/?>/);
  assert.match(html, /<meta property="og:image:width" content="2844"\s*\/?>/);
  assert.match(html, /<meta name="twitter:image:alt" content="三月七与星穹列车成员的纪念合影"\s*\/?>/);
  assert.ok(jsonLdSource, "JSON-LD metadata should be present");

  const jsonLd = JSON.parse(jsonLdSource);
  assert.deepEqual(
    jsonLd["@graph"].map((item) => item["@type"]),
    ["WebSite", "WebPage", "ImageObject"],
  );
});

test("publishes crawler discovery files and a real 404 page", async () => {
  const [robots, sitemap, notFound, workerConfigSource] = await Promise.all([
    readFile(new URL("robots.txt", clientUrl), "utf8"),
    readFile(new URL("sitemap.xml", clientUrl), "utf8"),
    readFile(new URL("404.html", clientUrl), "utf8"),
    readFile(new URL("../march7th/wrangler.json", clientUrl), "utf8"),
  ]);
  const workerConfig = JSON.parse(workerConfigSource);

  assert.match(robots, /Sitemap: https:\/\/march7th\.moe\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/march7th\.moe\/<\/loc>/);
  assert.match(notFound, /<meta name="robots" content="noindex,follow"\s*\/?>/);
  assert.match(notFound, /href="\/"/);
  assert.equal(workerConfig.assets.not_found_handling, "404-page");
});

test("redirects known domain variants to the canonical origin", async () => {
  const workerUrl = new URL("../dist/march7th/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://www.march7th.moe/?from=www"),
    {
      ASSETS: {
        fetch() {
          throw new Error("Canonical redirects must not reach the asset handler.");
        },
      },
    },
  );

  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://march7th.moe/?from=www");
});
