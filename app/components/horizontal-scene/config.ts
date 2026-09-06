import source from '../../../public/config/journey.properties?raw';

export type JourneyStage = {
  place: string; title: string; text: string; memory: string;
  symbol: string; tone: string; position: number;
};
export type JourneyConfig = {
  title: string; eyebrow: string; instruction: string; endLabel: string;
  background: string; ink: string; accent: string; playerX: number; decorCount: number;
  far: number; mid: number; near: number;
  revealY: number; revealScale: number; revealDuration: number;
  floatDuration: number; rotateDuration: number; walkDuration: number;
  stages: JourneyStage[];
};

export function parseJourneyConfig(text: string): JourneyConfig {
  const values = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const split = line.indexOf('=');
    if (split < 1) throw new Error(`旅途配置行缺少 =：${line}`);
    const key = line.slice(0, split).trim();
    if (values.has(key)) throw new Error(`旅途配置键重复：${key}`);
    values.set(key, line.slice(split + 1).trim());
  }
  const required = (key: string) => {
    const value = values.get(key);
    if (!value) throw new Error(`旅途配置缺少必填项：${key}`);
    return value;
  };
  const number = (key: string, min: number, max: number) => {
    const value = Number(required(key));
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new Error(`旅途配置 ${key} 必须为 ${min}–${max} 之间的有限数字`);
    }
    return value;
  };
  const color = (key: string) => {
    const value = required(key);
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`旅途配置 ${key} 必须是六位十六进制颜色`);
    return value;
  };
  const ids = [...new Set([...values.keys()].flatMap(key => {
    const match = /^stage\.(\d+)\./.exec(key);
    return match ? [Number(match[1])] : [];
  }))].sort((a, b) => a - b);
  if (ids.length < 2) throw new Error('旅途配置 stage.<序号> 至少需要两个节点');
  const stages = ids.map((id, index) => {
    if (id !== index + 1) throw new Error(`旅途配置缺少连续节点：stage.${index + 1}.position`);
    const prefix = `stage.${id}.`;
    return {
      position: number(`${prefix}position`, 0, 100),
      place: required(`${prefix}place`), title: required(`${prefix}title`),
      text: required(`${prefix}text`), memory: required(`${prefix}memory`),
      symbol: required(`${prefix}symbol`), tone: required(`${prefix}tone`),
    };
  });
  stages.forEach((stage, index) => {
    if (index === 0 ? stage.position !== 0 : stage.position - stages[index - 1].position < 0.85) {
      throw new Error(`旅途配置 stage.${index + 1}.position 首项须为 0，后续间距至少 0.85`);
    }
  });
  const far = number('motion.far', 0, 1);
  const mid = number('motion.mid', 0, 1);
  const near = number('motion.near', 1, 2);
  if (!(far < mid && mid < 1 && near > 1)) throw new Error('旅途配置速度须满足 motion.far < motion.mid < 1 < motion.near');
  const decorCount = number('scene.decorCount', 1, 24);
  if (!Number.isInteger(decorCount)) throw new Error('旅途配置 scene.decorCount 必须是整数');
  return {
    title: required('scene.title'), eyebrow: required('scene.eyebrow'),
    instruction: required('scene.instruction'), endLabel: required('scene.endLabel'),
    background: color('scene.background'), ink: color('scene.ink'), accent: color('scene.accent'),
    playerX: number('scene.playerX', 0.14, 0.2), decorCount, far, mid, near,
    revealY: number('motion.revealY', 0, 150), revealScale: number('motion.revealScale', 0.5, 1),
    revealDuration: number('motion.revealDuration', 0.1, 3),
    floatDuration: number('motion.floatDuration', 1, 60), rotateDuration: number('motion.rotateDuration', 5, 180),
    walkDuration: number('motion.walkDuration', 0.2, 3), stages,
  };
}

// 同一个 properties 文件同时提供预渲染快照和可更新的运行时配置。
export const initialJourneyConfig = parseJourneyConfig(source);
