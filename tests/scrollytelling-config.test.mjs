import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, test } from "node:test";
import { createServer } from "vite";

const vite = await createServer({ configFile: false, server: { middlewareMode: true } });
after(() => vite.close());
const { parseScrollyConfig, initialScrollyConfig: config } = await vite.ssrLoadModule("/app/config/scrollyConfig.ts");
const { getSceneState } = await vite.ssrLoadModule("/app/config/scrollyTimeline.ts");
const { worldDistance, layerWidth } = await vite.ssrLoadModule("/app/config/scrollyLayout.ts");
const source = await readFile(new URL("../public/config/scrollytelling.properties", import.meta.url), "utf8");
const edit = (key, value) => source.split("\n").map(line => line.startsWith(`${key}=`) ? `${key}=${value}` : line).join("\n");

test("开发快照、运行时配置和生产复制一致，生产 HUD 默认关闭", async () => {
  const copied = await readFile(new URL("../dist/client/config/scrollytelling.properties", import.meta.url), "utf8");
  assert.equal(copied, source);
  assert.deepEqual(parseScrollyConfig(copied), config);
  const html = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  for (const { id, label } of config.stations) {
    assert.ok(html.includes(id));
    assert.ok(html.includes(label));
  }
  assert.match(html, /scrolly-world/);
  assert.doesNotMatch(html, /class="scrolly-debug"|horizontal-scene/);
});

test("必填键、重复键、非法尺寸、颜色和时间顺序给出具体错误", () => {
  for (const key of ["layout.worldWidth", "timeline.HALO_ENTER", "slot.halo-hero.name", "station.SR-2.label", "motion.flashEnabled", "motion.irisOpacity"]) {
    assert.throws(() => parseScrollyConfig(source.split("\n").filter(line => !line.startsWith(`${key}=`)).join("\n")),
      error => error.message.includes(key));
  }
  for (const [key, value] of [
    ["layout.scrollDistance", "NaN"], ["layout.referenceHeight", "-1"],
    ["layout.worldWidth", "Infinity"], ["timeline.HALO_ENTER", "1"],
    ["timeline.END", "22"], ["timeline.START", "0.1"], ["motion.cardStagger", "2"],
    ["slot.halo-hero.width", "0"], ["slot.memory-bg.x", "50000"],
    ["station.SR-2.x", "1"], ["station.SR-2.type", "unknown"],
    ["color.green", "url(https://example.com)"], ["debug.enabled", "yes"],
    ["motion.irisOpacity", "1"], ["motion.cyanOpacity", "NaN"],
    ["motion.flashOpacity", "0.8"], ["motion.flashEnabled", "yes"],
    ["motion.irisApertureStartRatio", "0.8"], ["motion.flashStrokeRatio", "0.5"],
  ]) {
    assert.throws(() => parseScrollyConfig(edit(key, value)), error => error.message.includes(key), key);
  }
  assert.throws(() => parseScrollyConfig(source + "\nlayout.worldWidth=11200"), /layout.worldWidth/);
  assert.throws(() => parseScrollyConfig(edit("parallax.far", "0.9")), /parallax.far/);
});

test("scene 状态可以正反向纯计算，milestone 和世界几何保持一致", () => {
  assert.equal(config.duration, 23.38);
  assert.equal(worldDistance(config.layout), 9920);
  assert.equal(layerWidth(config.layout, config.parallax.foreground), 13680);
  assert.equal(config.stations.length, 11);
  const checkpoints = [[0, "WORLD_A"], [1.5, "WORLD_A_CARDS"], [7, "PANORAMA_A"],
    [13.65, "GREEN_IRIS"], [15.05, "HALO_HERO_HOLD"], [17.4, "MEMORY_HERO"],
    [19.4, "CYAN_FLASH"], [20.8, "MEMORY_HERO_FINAL"], [23.38, "MEMORY_HERO_FINAL"]];
  for (const [time, state] of [...checkpoints, ...checkpoints.toReversed()]) {
    assert.equal(getSceneState(time, config.milestones), state);
  }
});
