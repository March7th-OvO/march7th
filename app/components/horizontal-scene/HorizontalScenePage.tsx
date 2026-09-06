import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { initialJourneyConfig, parseJourneyConfig, type JourneyConfig, type JourneyStage } from './config';
import './HorizontalScenePage.css';

type SceneStyle = CSSProperties & Record<`--${string}`, string | number>;

function ParallaxLayer({ name, children }: { name: string; children: ReactNode }) {
  return <div className={`scene-layer ${name}`} aria-hidden="true">{children}</div>;
}

function FloatingDecor({ config }: { config: JourneyConfig }) {
  // 确定性分布：服务端与客户端一致，不在渲染过程中使用 Math.random。
  return Array.from({ length: config.decorCount }, (_, index) => (
    <i key={index} className={`scene-fragment ${index % 3 === 0 ? 'floatFast' : 'floatSlow'}`}
      style={{ left: `${index * 100 / config.decorCount}%`, top: `${13 + (index * 31) % 62}%`,
        '--delay': `${-(index % 7)}s`, '--angle': `${index * 29}deg` } as SceneStyle} />
  ));
}

function Player() {
  return <div className="scene-player" aria-hidden="true">
    <div className="scene-player-body">
      <svg viewBox="0 0 64 100" fill="currentColor">
        <circle cx="34" cy="19" r="12" />
        <path d="M25 32Q35 27 42 36L46 61Q34 70 20 62L24 41Z" />
        <path className="player-scarf" d="M27 31L4 39L1 33L25 27Z" />
        <path className="player-arm" d="M40 35Q43 33 45 38L54 52Q56 57 51 58L37 42Z" />
        <path className="player-leg player-leg-a" d="M25 58H34L30 87Q29 94 23 92L19 89L24 83Z" />
        <path className="player-leg player-leg-b" d="M34 58H43L42 82L48 87Q49 93 41 92L34 86Z" />
      </svg>
    </div>
    <span className="scene-player-shadow" />
  </div>;
}

function RouteNode({ stage, index, active }: { stage: JourneyStage; index: number; active: boolean }) {
  return <article className="scene-node" data-active={active} data-tone={stage.tone}
    id={`memory-${index + 1}`} style={{ '--position': stage.position } as SceneStyle}>
    <div className="scene-node-copy">
      <p className="scene-node-kicker"><span>SR-{String(index + 1).padStart(2, '0')}</span>{stage.place}</p>
      <h3>{stage.title}</h3>
      <p className="scene-description">{stage.text}</p>
      <blockquote>{stage.memory}</blockquote>
    </div>
    <div className="scene-node-marker" aria-hidden="true"><i /><span>{stage.place}</span></div>
    <div className="scene-chapter-art" aria-hidden="true">
      <span className="scene-chapter-number">{String(index + 1).padStart(2, '0')}</span>
      <div className="scene-emblem"><i className="rotateSlow" /><span>{stage.symbol}</span></div>
    </div>
  </article>;
}

function World({ config, active, worldRef }: {
  config: JourneyConfig; active: number; worldRef: React.RefObject<HTMLDivElement | null>;
}) {
  return <div className="world route-layer" ref={worldRef}>
    <div className="scene-route-line" aria-hidden="true"><i /></div>
    {config.stages.map((stage, index) => <RouteNode key={stage.tone} stage={stage} index={index} active={index === active} />)}
  </div>;
}

export default function HorizontalScenePage() {
  const [config, setConfig] = useState(initialJourneyConfig);
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<((index: number) => void) | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${import.meta.env.BASE_URL}config/journey.properties`, { signal: controller.signal, cache: 'no-cache' })
      .then(response => {
        if (!response.ok) throw new Error(`旅途配置读取失败：${response.status}`);
        return response.text();
      }).then(source => {
        const next = parseJourneyConfig(source);
        if (!controller.signal.aborted && JSON.stringify(next) !== JSON.stringify(initialJourneyConfig)) setConfig(next);
      }).catch(error => {
        if (!controller.signal.aborted) console.error('横向旅途保留构建配置。', error);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const root = sectionRef.current;
    const viewport = viewportRef.current;
    const world = worldRef.current;
    if (!root || !viewport || !world) return;

    const initialize = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference) and (min-height: 601px) and (min-width: 360px)', () => {
        root.dataset.enhanced = 'true';
        const nodes = Array.from(root.querySelectorAll<HTMLElement>('.scene-node'));
        let width = viewport.clientWidth;
        root.style.setProperty('--viewport-width', `${width}px`);
        let contextAlive = true;
        let distance = Math.max(0, world.scrollWidth - width);
        let current = -1;
        let walkingTimer: ReturnType<typeof setTimeout> | undefined;
        const measure = () => {
          width = viewport.clientWidth;
          root.style.setProperty('--viewport-width', `${width}px`);
          distance = Math.max(0, world.scrollWidth - width);
        };
        const update = (progress: number, direction: number, moving: boolean) => {
          viewport.style.setProperty('--progress', String(progress));
          const location = progress * distance / width;
          let next = 0;
          config.stages.forEach((stage, index) => { if (location >= stage.position - 0.16) next = index; });
          if (next !== current) { current = next; setActive(next); }
          viewport.dataset.direction = direction < 0 ? 'backward' : 'forward';
          if (moving) {
            viewport.dataset.walking = 'true';
            clearTimeout(walkingTimer);
            walkingTimer = setTimeout(() => { delete viewport.dataset.walking; }, 140);
          }
        };
        const timeline = gsap.timeline({
          defaults: { ease: 'none', duration: 1 },
          scrollTrigger: {
            trigger: root, pin: viewport, start: 'top top', end: () => `+=${distance}`,
            scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
            onRefreshInit: measure,
            onRefresh: self => update(self.progress, self.direction, false),
            onUpdate: self => update(self.progress, self.direction, self.isActive),
            onLeave: () => { delete viewport.dataset.walking; },
            onLeaveBack: () => { delete viewport.dataset.walking; },
          },
        });
        timeline.to(world, { x: () => -distance }, 0);
        // 图层是兄弟元素：实际位移为 0.3 / 0.6 / 1 / 1.3 倍，不叠加父级位移。
        for (const [selector, speed] of [['.background-far', config.far], ['.background-mid', config.mid], ['.foreground-near', config.near]] as const) {
          timeline.to(root.querySelector(selector), { x: () => -distance * speed }, 0);
        }
        nodes.slice(1).forEach(node => {
          gsap.fromTo(node.querySelector('.scene-node-copy'),
            { opacity: 0, y: config.revealY, scale: config.revealScale },
            { opacity: 1, y: 0, scale: 1, duration: config.revealDuration, ease: 'power2.out',
              scrollTrigger: { trigger: node, containerAnimation: timeline,
                start: 'left 96%', toggleActions: 'play none none reverse' } });
        });
        jumpRef.current = index => {
          const trigger = timeline.scrollTrigger;
          if (trigger) window.scrollTo({ top: trigger.start + config.stages[index].position * width, behavior: 'instant' });
        };
        // Resize/font loading may alter the section start or available travel distance.
        let refreshFrame = 0;
        const refresh = () => {
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        const observer = new ResizeObserver(entries => {
          if (entries.some(entry => Math.abs(entry.contentRect.width - width) > 1)) refresh();
        });
        observer.observe(viewport);
        window.addEventListener('load', refresh);
        void document.fonts.ready.then(() => { if (!disposed && contextAlive) refresh(); });
        refresh();
        return () => {
          contextAlive = false;
          clearTimeout(walkingTimer);
          cancelAnimationFrame(refreshFrame);
          observer.disconnect();
          window.removeEventListener('load', refresh);
          jumpRef.current = null;
          delete root.dataset.enhanced;
          delete viewport.dataset.walking;
          viewport.style.removeProperty('--progress');
          root.style.removeProperty('--viewport-width');
        };
      }, root);
      cleanup = () => media.revert();
    };
    void initialize().catch(error => console.error('横向旅途动效加载失败，保留可阅读章节。', error));
    return () => { disposed = true; cleanup?.(); };
  }, [config]);

  const jump = (index: number) => {
    if (jumpRef.current) jumpRef.current(index);
    else document.getElementById(`memory-${index + 1}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  const lastPosition = config.stages[config.stages.length - 1].position;
  const style: SceneStyle = {
    '--scene-bg': config.background, '--scene-ink': config.ink, '--scene-accent': config.accent,
    '--world-width': `calc(${lastPosition + 1} * var(--viewport-width, 100vw))`, '--route-length': `calc(${lastPosition} * var(--viewport-width, 100vw))`,
    '--player-x': `calc(${config.playerX} * var(--viewport-width, 100vw))`, '--float-duration': `${config.floatDuration}s`,
    '--rotate-duration': `${config.rotateDuration}s`, '--walk-duration': `${config.walkDuration}s`,
    '--stage-count': config.stages.length,
    '--near-width': `${(lastPosition * config.near + 1) * 100}vw`,
  };

  return <section ref={sectionRef} className="horizontal-scene scene-wrapper" id="memories" style={style} aria-labelledby="memory-atlas-title">
    <div className="scene-viewport" ref={viewportRef}>
      <header className="scene-header">
        <div><p>{config.eyebrow}</p><h2 id="memory-atlas-title">{config.title}</h2></div>
        <a className="scene-skip" href="#forms">继续浏览 <span aria-hidden="true">↗</span></a>
      </header>
      <div className="scene-stage">
        <ParallaxLayer name="background-far">
          {config.stages.map((stage, index) => <div className="scene-far-composition" key={stage.tone} style={{ left: `${index * 52}vw` }}>
            <i className="scene-planet pulseSoft" /><span>{index % 2 === 0 ? 'MARCH' : 'MEMORY'}</span>
          </div>)}
        </ParallaxLayer>
        <ParallaxLayer name="background-mid">
          {config.stages.map(stage => <div className="scene-mid-composition" key={stage.tone} style={{ left: `${stage.position * 65 + 54}vw` }}>
            <i className="scene-arch" /><i className="scene-orb floatSlow" />
            <span className="scene-coordinate">{stage.place} / M7</span>
          </div>)}
        </ParallaxLayer>
        <World config={config} active={active} worldRef={worldRef} />
        <ParallaxLayer name="foreground-near"><FloatingDecor config={config} />
          {config.stages.map((stage, index) => <i key={stage.tone} className={`scene-near-shape scene-near-shape-${index % 2}`} style={{ left: `${stage.position * 130 + 72}vw` }} />)}
        </ParallaxLayer>
      </div>
      <Player />
      <footer className="scene-hud">
        <div className="scene-hud-top"><p>{active === config.stages.length - 1 ? config.endLabel : config.instruction}<span aria-hidden="true"> ↓ →</span></p>
          <span className="scene-count">{String(active + 1).padStart(2, '0')} <i>/ {String(config.stages.length).padStart(2, '0')}</i></span></div>
        <nav className="scene-navigation" aria-label="旅途章节">
          {config.stages.map((stage, index) => <button key={stage.tone} type="button" onClick={() => jump(index)}
            aria-current={active === index ? 'step' : undefined} aria-label={`前往${stage.place}`}>
            <span className="scene-nav-index">{String(index + 1).padStart(2, '0')}</span><span className="scene-nav-label">{stage.place}</span>
          </button>)}
        </nav>
      </footer>
    </div>
  </section>;
}
