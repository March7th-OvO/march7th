import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, test } from "node:test";
import { createServer } from "vite";

const vite = await createServer({ configFile: false, server: { middlewareMode: true } });
after(() => vite.close());
const { parseScrollyConfig, initialScrollyConfig: config } = await vite.ssrLoadModule("/app/config/scrollyConfig.ts");
const { getSceneState } = await vite.ssrLoadModule("/app/config/scrollyTimeline.ts");
const { worldDistance, layerWidth } = await vite.ssrLoadModule("/app/config/scrollyLayout.ts");
const { resolveScrollyAssetSrc } = await vite.ssrLoadModule("/app/config/scrollyAssets.ts");
const source = await readFile(new URL("../public/config/scrollytelling.properties", import.meta.url), "utf8");
const edit = (key, value) => source.split("\n").map(line => line.startsWith(`${key}=`) ? `${key}=${value}` : line).join("\n");

test("开发快照、运行时配置和生产复制一致，生产 HUD 默认关闭", async () => {
  const copied = await readFile(new URL("../dist/client/config/scrollytelling.properties", import.meta.url), "utf8");
  assert.equal(copied, source);
  assert.deepEqual(parseScrollyConfig(copied), config);
  const html = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  for (const { id, displayId, label } of config.stations) {
    assert.ok(html.includes(id));
    assert.ok(html.includes(displayId));
    assert.ok(html.includes(label));
  }
  assert.match(html, /scrolly-world/);
  assert.doesNotMatch(html, /class="scrolly-debug"|horizontal-scene/);
});

test("必填键、重复键、非法尺寸、颜色和时间顺序给出具体错误", () => {
  for (const key of ["layout.worldWidth", "timeline.HALO_ENTER", "slot.halo-hero.name", "slot.halo-hero.src", "station.SR-2.displayId", "station.SR-2.label", "motion.chapterTitleY", "motion.chapterTitleDuration", "motion.chapterTitleViewportX", "motion.journeyRevealDuration", "motion.journeyRevealViewportX", "motion.flashEnabled", "motion.irisOpacity", "color.lightBackground", "color.softSurface", "color.primaryPink", "color.iceHighlight", "color.vividAccent", "color.night", "color.secondaryBlue", "color.decorativePurple"]) {
    assert.throws(() => parseScrollyConfig(source.split("\n").filter(line => !line.startsWith(`${key}=`)).join("\n")),
      error => error.message.includes(key));
  }
  for (const [key, value] of [
    ["layout.scrollDistance", "NaN"], ["layout.referenceHeight", "-1"],
    ["layout.worldWidth", "Infinity"], ["timeline.HALO_ENTER", "1"],
    ["timeline.END", "22"], ["timeline.START", "0.1"], ["motion.cardStagger", "2"],
    ["slot.halo-hero.width", "0"], ["slot.memory-bg.x", "50000"],
    ["station.SR-2.x", "1"], ["station.SR-2.type", "unknown"],
    ["color.decorativePurple", "url(https://example.com)"], ["debug.enabled", "yes"],
    ["motion.irisOpacity", "1"], ["motion.cyanOpacity", "NaN"],
    ["motion.flashOpacity", "0.8"], ["motion.flashEnabled", "yes"],
    ["motion.irisApertureStartRatio", "0.8"], ["motion.flashStrokeRatio", "0.5"],
    ["motion.chapterTitleY", "1"], ["motion.chapterTitleDuration", "8"], ["motion.chapterTitleViewportX", "2"],
    ["motion.journeyRevealDuration", "8"], ["motion.journeyRevealViewportX", "2"],
    ["slot.halo-hero.src", "javascript:alert(1)"], ["slot.memory-bg.src", "file:///tmp/image.png"],
    ["slot.opening-bg.src", "https://"],
  ]) {
    assert.throws(() => parseScrollyConfig(edit(key, value)), error => error.message.includes(key), key);
  }
  assert.throws(() => parseScrollyConfig(source + "\nlayout.worldWidth=11200"), /layout.worldWidth/);
  assert.throws(() => parseScrollyConfig(edit("parallax.far", "0.9")), /parallax.far/);
});

test("八项语义主题色完整解析为指定色卡", () => {
  assert.deepEqual(config.colors, {
    lightBackground: "#FFE7F3",
    softSurface: "#FFCDDE",
    primaryPink: "#FEA2BA",
    iceHighlight: "#7EFAFF",
    vividAccent: "#1ADEE6",
    night: "#353568",
    secondaryBlue: "#6F9DEC",
    decorativePurple: "#BA8CC3",
  });
});

test("收尾文案字体保存在本地并复制到生产构建", async () => {
  for (const path of [
    "fonts/zcool-kuaile/zcool-kuaile-regular.ttf",
    "fonts/zcool-kuaile/OFL.txt",
    "fonts/league-script/league-script-latin-400.woff2",
    "fonts/league-script/OFL.txt",
  ]) {
    const sourceFile = await readFile(new URL(`../public/${path}`, import.meta.url));
    const builtFile = await readFile(new URL(`../dist/client/${path}`, import.meta.url));
    assert.ok(sourceFile.length > 0);
    assert.deepEqual(builtFile, sourceFile);
  }
});

test("素材路径集中配置并按部署 BASE_URL 解析", () => {
  const relative = parseScrollyConfig(edit("slot.halo-hero.src", "assets/scrollytelling/halo.webp"));
  const remote = parseScrollyConfig(edit("slot.memory-bg.src", "https://cdn.example.com/memory.webp"));
  assert.equal(relative.slots["halo-hero"].src, "assets/scrollytelling/halo.webp");
  assert.equal(resolveScrollyAssetSrc(relative.slots["halo-hero"].src, "/march7th/"), "/march7th/assets/scrollytelling/halo.webp");
  assert.equal(resolveScrollyAssetSrc("/assets/absolute.webp", "/march7th/"), "/assets/absolute.webp");
  assert.equal(resolveScrollyAssetSrc(remote.slots["memory-bg"].src, "/march7th/"), "https://cdn.example.com/memory.webp");
});

test("scene 状态可以正反向纯计算，milestone 和世界几何保持一致", () => {
  assert.equal(config.duration, 23.38);
  assert.equal(worldDistance(config.layout), 9920);
  assert.equal(layerWidth(config.layout, config.parallax.foreground), 13680);
  assert.equal(config.stations.length, 8);
  const stationGaps = config.stations.slice(1, -1).map((station, index) => station.worldX - config.stations[index].worldX);
  assert.ok(stationGaps.every(gap => gap === stationGaps[0]));
  assert.ok(config.stations.at(-1).worldX - config.stations.at(-2).worldX < stationGaps[0]);
  const [sixPhasedIce, prologue, firstAct] = config.stations;
  const cards = ["portrait-01", "portrait-02", "portrait-03", "portrait-04"].map(id => config.slots[id]);
  const titles = ["title-prologue", "title-act-1", "title-act-2", "title-act-3", "title-act-4", "title-act-5"].map(id => config.slots[id]);
  const encounterOrder = [
    sixPhasedIce.worldX / config.parallax.rail,
    ...cards.slice(0, 3).map(card => card.x / config.parallax.hero),
    prologue.worldX / config.parallax.rail,
    cards[3].x / config.parallax.hero,
    firstAct.worldX / config.parallax.rail,
  ];
  assert.ok(encounterOrder.every((position, index) => index === 0 || position > encounterOrder[index - 1]));
  assert.deepEqual([cards[3].width, cards[3].height], [330, 330]);
  const panorama = config.slots["panorama-character"];
  assert.ok(panorama.x > cards[3].x);
  assert.deepEqual([panorama.width, panorama.height], [400, 300]);
  assert.deepEqual(titles.map(title => title.name), config.stations.slice(1, -1).map(station => station.label));
  titles.forEach((title, index) => {
    const titlePosition = title.x / config.parallax.typography;
    assert.ok(titlePosition > config.stations[index + 1].worldX / config.parallax.rail);
    if (config.stations[index + 2]) assert.ok(titlePosition < config.stations[index + 2].worldX / config.parallax.rail);
  });
  assert.equal(config.stations.at(-1).label, "未完待续");
  assert.equal(config.slots["journey-card"].name, "开拓之旅途还未到终点，March7th依然在寻找身世的路上~");
  const journeyCard = config.slots["journey-card"];
  assert.deepEqual([journeyCard.width, journeyCard.height], [640, 44]);
  assert.equal(journeyCard.x - worldDistance(config.layout) * config.parallax.foreground, 390);
  assert.equal(journeyCard.y, 380);
  assert.ok(journeyCard.x / config.parallax.foreground > config.stations.at(-2).worldX);
  assert.ok(journeyCard.x / config.parallax.foreground < config.stations.at(-1).worldX);
  assert.ok(Math.abs(config.milestones.CARDS_EXPAND - config.milestones.CARDS_START - 0.6) < Number.EPSILON);
  const checkpoints = [[0, "WORLD_A"], [0.95, "WORLD_A_CARDS"], [7, "PANORAMA_A"],
    [13.65, "GREEN_IRIS"], [15.05, "HALO_HERO_HOLD"], [17.4, "MEMORY_HERO"],
    [19.4, "CYAN_FLASH"], [20.8, "MEMORY_HERO_FINAL"], [23.38, "MEMORY_HERO_FINAL"]];
  for (const [time, state] of [...checkpoints, ...checkpoints.toReversed()]) {
    assert.equal(getSceneState(time, config.milestones), state);
  }
});
