/* global window, document, getComputedStyle, DOMMatrix, innerWidth */
// 手动浏览器回归：PLAYWRIGHT_MODULE_PATH 可指向已有 Playwright 安装，无需改项目运行时依赖。
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const base = process.env.SCROLLY_TEST_URL || "http://localhost:5173";
const output = new URL("../outputs/scrollytelling/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.SCROLLY_BROWSER || "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 576 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "warning") errors.push(message.text()); });
await page.addInitScript(() => {
  window.__reactCommits = 0;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true, renderers: new Map(),
    inject(renderer) { this.renderers.set(1, renderer); return 1; },
    onCommitFiberRoot: () => { window.__reactCommits++; },
    onCommitFiberUnmount: () => {},
  };
});

try {
  await page.goto(base);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('#memories[data-enhanced="true"]');
  // 使用实际 Vite 模块 URL，读取当前实例而非导入第二份 GSAP。
  const attachInspector = () => page.evaluate(async () => {
    const source = await (await fetch("/app/hooks/useScrollytelling.ts")).text();
    const url = source.match(/from "(.*gsap_ScrollTrigger[^"]*)"/)[1];
    window.__scrollyST = (await import(url)).ScrollTrigger;
  });
  await attachInspector();
  const info = () => page.evaluate(() => {
    const triggers = window.__scrollyST.getAll().filter(item => item.vars.id === "scrollytelling-master");
    const trigger = triggers[0];
    return { count: triggers.length, start: trigger?.start, end: trigger?.end,
      duration: trigger?.animation.duration(), spacers: document.querySelectorAll(".pin-spacer").length };
  });
  assert.equal((await info()).count, 1);
  assert.equal((await info()).duration, 23.38);
  assert.equal((await info()).end - (await info()).start, 9800);
  const seek = async time => {
    await page.evaluate(time => {
      const trigger = window.__scrollyST.getById("scrollytelling-master");
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * time / 23.38, behavior: "instant" });
    }, time);
    await page.waitForTimeout(100);
  };
  const snapshot = () => page.evaluate(() => {
    const get = selector => document.querySelector(selector);
    const css = selector => getComputedStyle(get(selector));
    const x = selector => new DOMMatrix(css(selector).transform).m41;
    return {
      time: window.__scrollyST.getById("scrollytelling-master").animation.time(),
      scene: get("#memories").dataset.scene,
      layers: Object.fromEntries([...document.querySelectorAll("[data-parallax]")].map(el => [el.dataset.parallax, new DOMMatrix(getComputedStyle(el).transform).m41])),
      cards: [...document.querySelectorAll(".portrait-card")].map(el => +getComputedStyle(el).opacity),
      chapterTitles: [...document.querySelectorAll(".chapter-title-motion")].map(el => {
        const style = getComputedStyle(el), matrix = new DOMMatrix(style.transform);
        return { opacity: +style.opacity, y: matrix.m42 };
      }),
      journey: {
        opacity: +css(".journey-message-motion").opacity,
        clipPath: css(".journey-message-motion").clipPath,
        z: +css(".scrolly-layer-journey").zIndex,
      },
      cover: +get(".green-iris-cover").getAttribute("r"), aperture: +get(".green-iris-aperture").getAttribute("r"),
      irisOpacity: +css(".green-iris").opacity, cyanOpacity: +css(".cyan-transition").opacity,
      cyan: x(".cyan-surface"), flash: +css(".cyan-flash").opacity, memory: css(".memory-reveal").clipPath,
      hud: { x: get(".scrolly-hud").getBoundingClientRect().x, y: get(".scrolly-hud").getBoundingClientRect().y },
      walker: get(".scrolly-walker").dataset.walkerState,
      commits: window.__reactCommits,
    };
  });
  const times = [0, 1.8, 3.5, 7, 12.8, 13.55, 13.73, 13.83, 13.9, 14.1, 14.5, 15.1, 16.0, 16.5, 16.93, 17.4, 19.56, 20.1, 20.9, 23.38];
  const samples = [];
  for (const time of times) {
    await seek(time);
    samples.push(await snapshot());
    if ([0, 3.5, 7, 13.83, 14.1, 14.5, 16.5, 16.93, 17.4, 19.56, 23.38].includes(time))
      await page.screenshot({ path: new URL(`time-${time}.png`, output).pathname.replace(/^\/(\w:)/, "$1") });
  }
  assert.equal(samples[0].cards[0], 0);
  assert.equal(samples[2].cards[3], 1);
  const at = time => samples[times.indexOf(time)];
  assert.ok(at(3.5).chapterTitles[0].opacity > 0 && at(3.5).chapterTitles[0].y < 0);
  assert.ok(at(7).chapterTitles[1].opacity > 0 && at(7).chapterTitles[1].y < 0);
  assert.equal(at(20.9).journey.opacity, 0);
  assert.equal(samples.at(-1).journey.opacity, 1);
  assert.match(samples.at(-1).journey.clipPath, /inset\(0px\)/);
  assert.ok(samples.at(-1).journey.z > 70);
  assert.ok(at(14.1).cover > at(14.1).aperture && at(14.1).aperture > 0);
  assert.equal(at(15.1).cover, at(15.1).aperture);
  assert.equal(at(15.1).irisOpacity, 0);
  assert.equal(at(17.4).cyanOpacity, 0);
  assert.match(at(17.4).memory, /75%/);
  assert.notEqual(at(16.93).memory, "circle(0% at 50% 50%)", "cyan 转场期间角色已在揭示");
  assert.ok(Math.abs(samples.at(-1).layers.rail + 9920) < 0.1);
  for (const sample of samples) {
    assert.ok(sample.irisOpacity >= 0 && sample.irisOpacity <= 0.14);
    assert.ok(sample.cyanOpacity >= 0 && sample.cyanOpacity <= 0.16, "不得用不透明 cyan 遮住主体");
    assert.equal(sample.flash, 0, "默认关闭装饰性闪光，包括原先的闪光峰值");
    if (sample.time > 0) {
      for (const [layer, factor] of Object.entries({ far: .35, background: .6, hero: .8, rail: 1, foreground: 1.25, extreme: 1.45 }))
        assert.ok(Math.abs(sample.layers[layer] - sample.layers.rail * factor) < 0.2, layer);
    }
    assert.ok(Math.abs(sample.hud.x - samples[0].hud.x) < 1);
    assert.ok(Math.abs(sample.hud.y - samples[0].hud.y) < 1);
    assert.equal(sample.commits, samples[0].commits, "滚动不触发 React 提交");
  }
  for (let index = times.length - 1; index >= 0; index--) {
    await seek(times[index]);
    const reversed = await snapshot(), original = samples[index];
    assert.ok(Math.abs(reversed.layers.rail - original.layers.rail) < 0.1);
    assert.ok(Math.abs(reversed.aperture - original.aperture) < 0.1);
    assert.ok(Math.abs(reversed.cover - original.cover) < 0.1);
    assert.ok(Math.abs(reversed.cyan - original.cyan) < 0.1);
    assert.equal(reversed.flash, original.flash);
    assert.equal(reversed.irisOpacity, original.irisOpacity);
    assert.equal(reversed.cyanOpacity, original.cyanOpacity);
    assert.deepEqual(reversed.cards, original.cards);
    reversed.chapterTitles.forEach((title, titleIndex) => {
      assert.ok(Math.abs(title.opacity - original.chapterTitles[titleIndex].opacity) < 0.001);
      assert.ok(Math.abs(title.y - original.chapterTitles[titleIndex].y) < 0.1);
    });
    assert.ok(Math.abs(reversed.journey.opacity - original.journey.opacity) < 0.001);
    assert.equal(reversed.journey.clipPath, original.journey.clipPath);
    assert.equal(reversed.memory, original.memory);
  }
  await seek(10);
  await page.waitForTimeout(350);
  assert.equal((await snapshot()).walker, "idle", "停滚后 Walker 回到 idle");

  for (const [width, height] of [[1920, 1080], [2560, 1440], [390, 844], [1280, 576]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(400);
    await seek(7);
    assert.equal((await info()).count, 1);
    assert.equal((await info()).spacers, 1);
    const dimensions = await page.locator(".scrolly-design-surface").boundingBox();
    const scale = height > width ? height / 576 : Math.min(width / 1280, height / 576);
    assert.ok(Math.abs(dimensions.width - 1280 * scale) < 1);
    assert.ok(Math.abs(dimensions.height - 576 * scale) < 1);
    if (height > width) {
      assert.ok(Math.abs(dimensions.x) < 1, "竖屏设计面从左侧取景，保留 Walker 和路线起点");
      assert.ok(Math.abs(dimensions.height - height) < 1, "竖屏设计面必须填满 viewport 高度");
    }
    const overlay = await page.locator(".scrolly-transition-surface").boundingBox();
    assert.ok(overlay.width >= width - 1 && overlay.height >= height - 1, "转场覆盖完整视口");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  // 结束后解除 pin，继续滚动进入后续页面内容。
  await page.evaluate(() => {
    const trigger = window.__scrollyST.getById("scrollytelling-master");
    window.scrollTo({ top: trigger.end + 300, behavior: "instant" });
  });
  await page.waitForTimeout(100);
  assert.ok((await page.locator(".scrolly-stage").boundingBox()).y < -200);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(300);
  assert.equal((await info()).count, 0);
  assert.equal((await info()).spacers, 0);
  assert.equal(await page.locator(".portrait-card").first().evaluate(el => getComputedStyle(el).visibility), "visible");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(300);
  assert.equal((await info()).count, 1);
  assert.equal((await info()).spacers, 1);

  // 运行时异常必须给出配置键，并移除当前 pin/timeline。
  const config = await (await page.request.get(`${base}/config/scrollytelling.properties`)).text();
  await page.route("**/config/scrollytelling.properties", route => route.fulfill({
    body: config.replace("layout.scrollDistance=9800", "layout.scrollDistance=12000").replace("station.SR-1.label=雅利洛-Ⅵ", "station.SR-1.label=运行时站点").replace("motion.flashEnabled=false", "motion.flashEnabled=true"),
  }));
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('#memories[data-enhanced="true"]');
  await attachInspector();
  assert.equal((await info()).count, 1);
  assert.equal((await info()).end - (await info()).start, 12000);
  assert.equal(await page.getByText("运行时站点", { exact: true }).count(), 1);
  await seek(19.56);
  assert.ok((await snapshot()).flash < 0.02, "开启后也不能快速升至高亮");
  await seek(20.1);
  assert.ok(Math.abs((await snapshot()).flash - 0.08) < 0.001, "可选弧光峰值维持低对比度");
  await page.unroute("**/config/scrollytelling.properties");
  await page.route("**/config/scrollytelling.properties", route => route.fulfill({ body: config.replace("layout.worldWidth=11200", "layout.worldWidth=NaN") }));
  await page.reload();
  await page.waitForSelector('[role="alert"]');
  assert.match(await page.locator('[role="alert"]').innerText(), /layout.worldWidth/);
  assert.equal(await page.locator(".pin-spacer").count(), 0);
  assert.deepEqual(errors, []);
  await writeFile(new URL("browser-results.json", output), JSON.stringify({ passed: true, samples, checks: ["forward/reverse", "parallax", "iris mask", "cyan curve", "flash", "no React commits", "idle", "resize", "unpin", "reduced motion", "runtime config failure"] }, null, 2));
  console.log("PASS: forward/reverse, parallax, transitions, React commits, resize, unpin, reduced motion, config failure");
} catch (error) {
  console.error({ errors, body: (await page.locator("body").innerText()).slice(-1800) });
  throw error;
} finally {
  await browser.close();
}
