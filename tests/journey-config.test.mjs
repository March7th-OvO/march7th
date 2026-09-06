import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ configFile: false, server: { middlewareMode: true } });
after(() => vite.close());
const { parseJourneyConfig, initialJourneyConfig } = await vite.ssrLoadModule('/app/components/horizontal-scene/config.ts');
const source = await readFile(new URL('../public/config/journey.properties', import.meta.url), 'utf8');

test('development config, prerender snapshot, and production public config agree', async () => {
  const copied = await readFile(new URL('../dist/client/config/journey.properties', import.meta.url), 'utf8');
  assert.equal(copied, source);
  assert.deepEqual(parseJourneyConfig(copied), initialJourneyConfig);
  const html = await readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8');
  for (const stage of initialJourneyConfig.stages) {
    assert.ok(html.includes(stage.place));
    assert.ok(html.includes(stage.title));
    assert.ok(html.includes(stage.text));
  }
  assert.doesNotMatch(html, /class="journey-window"/);
  assert.match(html, /aria-label="旅途章节"/);
});

test('missing config values identify the exact key', () => {
  assert.throws(() => parseJourneyConfig(source.replace(/^motion\.far=.*\n/m, '')), /motion\.far/);
  assert.throws(() => parseJourneyConfig(source.replace(/^stage\.2\.title=.*\n/m, '')), /stage\.2\.title/);
});

test('rejects invalid motion, unsafe colors, and overlapping chapter positions', () => {
  for (const [key, invalid] of [
    ['motion.mid', 'NaN'], ['motion.near', '-1'], ['motion.revealDuration', 'Infinity'],
    ['scene.background', 'url(https://example.com)'], ['scene.decorCount', '3.5'],
    ['stage.2.position', '0.2'],
  ]) {
    const edited = source.split('\n').map(line => line.startsWith(`${key}=`) ? `${key}=${invalid}` : line).join('\n');
    assert.throws(() => parseJourneyConfig(edited), error => error.message.includes(key));
  }
  assert.throws(() => parseJourneyConfig(source.replace('motion.far=0.3', 'motion.far=0.8')), /motion.far/);
});
