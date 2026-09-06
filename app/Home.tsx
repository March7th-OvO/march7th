import { useEffect, useRef, useState } from "react";
import ScrollytellingPage from "./components/scrollytelling/ScrollytellingPage";

const assetHost = "https://assets.march7th.moe";

const imageUrl = (path: string, width: number, quality = 78) =>
  `${assetHost}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${path}`;

const imageSrcSet = (path: string, widths: number[], quality = 78) =>
  widths.map((width) => `${imageUrl(path, width, quality)} ${width}w`).join(", ");

type TypedQuoteOptions = {
  typeSpeed: number;
  backSpeed: number;
  backDelay: number;
  startDelay: number;
  smartBackspace: boolean;
  loop: boolean;
  cursorChar: string;
};

const parseProperties = (source: string) => {
  const properties = new Map<string, string>();

  source.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) return;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && value) properties.set(key, value);
  });

  return properties;
};

const requireProperty = (properties: Map<string, string>, key: string) => {
  const value = properties.get(key);
  if (!value) throw new Error(`语录配置缺少必填项：${key}`);
  return value;
};

const parseNonNegativeInteger = (properties: Map<string, string>, key: string) => {
  const value = requireProperty(properties, key);
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`语录配置 ${key} 必须是非负整数，当前值为：${value}`);
  }

  return parsed;
};

const parseBoolean = (properties: Map<string, string>, key: string) => {
  const value = requireProperty(properties, key);
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`语录配置 ${key} 必须是 true 或 false，当前值为：${value}`);
};

const parseTypedQuoteConfig = (source: string) => {
  const properties = parseProperties(source);
  const entries: Array<{ order: number; text: string }> = [];

  properties.forEach((text, key) => {
    const match = /^quote\.(\d+)$/.exec(key);
    if (!match) return;

    const order = Number(match[1]);
    if (Number.isSafeInteger(order) && text) entries.push({ order, text });
  });

  const quotes = entries
    .sort((left, right) => left.order - right.order)
    .map(({ text }) => text);

  if (quotes.length === 0) throw new Error("语录配置中没有有效的 quote.<序号> 条目");

  const options: TypedQuoteOptions = {
    typeSpeed: parseNonNegativeInteger(properties, "typed.typeSpeed"),
    backSpeed: parseNonNegativeInteger(properties, "typed.backSpeed"),
    backDelay: parseNonNegativeInteger(properties, "typed.backDelay"),
    startDelay: parseNonNegativeInteger(properties, "typed.startDelay"),
    smartBackspace: parseBoolean(properties, "typed.smartBackspace"),
    loop: parseBoolean(properties, "typed.loop"),
    cursorChar: requireProperty(properties, "typed.cursorChar"),
  };

  return { quotes, options };
};

const loadTypedQuoteConfig = async (signal: AbortSignal) => {
  const configUrl = `${import.meta.env.BASE_URL}config/quotes.properties`;
  const response = await fetch(configUrl, { signal });

  if (!response.ok) {
    throw new Error(`语录配置读取失败：${response.status} ${response.statusText}`);
  }

  return parseTypedQuoteConfig(await response.text());
};

export default function Home() {
  const [activeProfileCard, setActiveProfileCard] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const typedQuoteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  useEffect(() => {
    const target = typedQuoteRef.current;
    if (!target) return;

    let disposed = false;
    let typedInstance: { destroy: () => void } | undefined;
    const controller = new AbortController();

    const initTypedQuote = async () => {
      try {
        const typedQuoteConfig = await loadTypedQuoteConfig(controller.signal);
        if (disposed || !typedQuoteRef.current) return;

        // 尊重系统的减少动态效果设置，保留配置中的首句作为静态展示。
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          typedQuoteRef.current.textContent = typedQuoteConfig.quotes[0];
          return;
        }

        const { default: Typed } = await import("typed.js");
        if (disposed || !typedQuoteRef.current) return;

        typedInstance = new Typed(typedQuoteRef.current, {
          strings: typedQuoteConfig.quotes,
          ...typedQuoteConfig.options,
        });
      } catch (error) {
        if (disposed) return;
        console.error(error);
        if (typedQuoteRef.current) typedQuoteRef.current.textContent = "语录暂时读取失败。";
      }
    };

    void initTypedQuote();

    return () => {
      disposed = true;
      controller.abort();
      typedInstance?.destroy();
    };
  }, []);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="回到首页">
          <span className="brand-mark">M7</span>
          <span>March 7th</span>
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label="打开导航"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"}>
          <a href="#profile" onClick={() => setMenuOpen(false)}>角色档案</a>
          <a href="#memories" onClick={() => setMenuOpen(false)}>旅途时间轴</a>
          <a href="#forms" onClick={() => setMenuOpen(false)}>旅途剪影</a>
          <a href="/photo-wall" onClick={() => setMenuOpen(false)}>时光回廊</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">ASTRAL EXPRESS · PASSENGER NO. 7</p>
          <h1 className="max-w-6xl">
            把今天，<br />
            <em>拍成明天的回忆。</em>
          </h1>
          <p className="hero-intro">
            她从六相冰中醒来，以重获新生的日期为名。相机是她珍藏现在的方式，笑容则是她面对未知的答案。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#profile">翻开角色档案 <span>↘</span></a>
            <a className="text-button" href="#memories">查看她的旅途 <span>→</span></a>
          </div>
          <dl className="hero-facts" aria-label="角色基础信息">
            <div><dt>姓名</dt><dd>三月七</dd></div>
            <div><dt>阵营</dt><dd>星穹列车</dd></div>
            <div><dt>爱好</dt><dd>摄影</dd></div>
          </dl>
        </div>

        <div className="hero-visual" aria-label="三月七主题主视觉">
          <div className="visual-frame">
            <img
              className="hero-art"
              src={imageUrl("image/backgrounds/hezhao.png", 1280, 78)}
              srcSet={imageSrcSet("image/backgrounds/hezhao.png", [640, 960, 1280, 1600], 78)}
              sizes="(max-width: 680px) 82vw, (max-width: 980px) 75vw, (min-width: 1455px) 640px, 44vw"
              width={2844}
              height={1600}
              alt="星穹列车成员在庆典街景前的集体合影"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <div className="polaroid-note note-top">
            <span>NO. 0307</span>
            <strong>Say cheese!</strong>
          </div>
          <div className="polaroid-note note-bottom">
            <strong>列车组今日合影</strong>
            <span>请勿删除 ★</span>
          </div>
        </div>

        <p className="scroll-note">SCROLL TO DEVELOP THE FILM <span>↓</span></p>
      </section>

      <section className="profile-section" id="profile">
        <p
          className="profile-quote"
          aria-label="三月七的八条角色语录正在循环播放"
        >
          <span aria-hidden="true">“</span>
          <span className="typed-quote-text" ref={typedQuoteRef} aria-hidden="true" />
          <span aria-hidden="true">”</span>
        </p>

        <div className="section-heading">
          <p className="eyebrow">CHARACTER FILE / 角色档案</p>
          <h2>遗失过去的人，<br /><span>最认真地收藏现在。</span></h2>
        </div>

        <div
          className="profile-grid"
          data-active-card={activeProfileCard}
          onMouseLeave={() => setActiveProfileCard(0)}
        >
          <article
            className={activeProfileCard === 0 ? "profile-card intro-card is-active" : "profile-card intro-card"}
            tabIndex={0}
            aria-label="个性档案"
            onMouseEnter={() => setActiveProfileCard(0)}
            onFocus={() => setActiveProfileCard(0)}
          >
            <span className="card-index">01</span>
            <div className="profile-symbol intro-symbol" aria-hidden="true">M7</div>
            <div className="profile-expanded">
              <p>「咱可不是什么神秘人物，只是个热爱拍照、偶尔会把事情搞砸的普通列车乘客啦！」</p>
              <footer><span>个性</span><strong>明快 · 真诚 · 好奇</strong></footer>
            </div>
          </article>
          <article
            className={activeProfileCard === 1 ? "profile-card ice-card is-active" : "profile-card ice-card"}
            tabIndex={0}
            aria-label="记忆起点档案"
            onMouseEnter={() => setActiveProfileCard(1)}
            onFocus={() => setActiveProfileCard(1)}
            onBlur={() => setActiveProfileCard(0)}
          >
            <span className="card-index">02</span>
            <div className="profile-symbol ice-symbol" aria-hidden="true">✦</div>
            <div className="profile-expanded">
              <p>「从六相冰中醒来的那天，她没有找到过去，却在星穹列车上遇见了可以一同前往未来的人。」</p>
              <footer><span>记忆起点</span><strong>六相冰</strong></footer>
            </div>
          </article>
          <article
            className={activeProfileCard === 2 ? "profile-card camera-card is-active" : "profile-card camera-card"}
            tabIndex={0}
            aria-label="摄影档案"
            onMouseEnter={() => setActiveProfileCard(2)}
            onFocus={() => setActiveProfileCard(2)}
            onBlur={() => setActiveProfileCard(0)}
          >
            <span className="card-index">03</span>
            <div className="profile-symbol camera-symbol" aria-hidden="true">∞</div>
            <div className="profile-expanded">
              <div className="camera-copy">
                <small>PHOTO COUNT</small>
                <strong>∞</strong>
                <p>照片不会忘记，<br />所以她负责按下快门。</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <ScrollytellingPage />

      <section className="forms-section" id="forms">
        <div className="section-heading compact">
          <p className="eyebrow">THREE FRAMES / 旅途剪影</p>
          <h2>同一个她，<span>三种光芒。</span></h2>
        </div>
        <div className="forms-grid">
          <article className="form-card preservation">
            <div className="form-top"><span>ICE</span><span>存护</span></div>
            <div className="relative -mx-7 mb-7 mt-6 h-80 overflow-hidden border-y border-current/10 bg-white/10">
              <img
                className="block h-full w-full object-contain object-bottom"
                src={imageUrl("image/illustration/cunhu.jpg", 720, 78)}
                srcSet={imageSrcSet("image/illustration/cunhu.jpg", [360, 540, 720, 960], 78)}
                sizes="(max-width: 680px) calc(100vw - 40px), (max-width: 980px) 88vw, 400px"
                alt="三月七存护形态立绘"
                loading="lazy"
                decoding="async"
              />
              <span className="absolute bottom-3 left-7 text-[96px] font-black leading-[.85] tracking-[-.1em] opacity-20" aria-hidden="true">01</span>
            </div>
            <h3>最初的三月七</h3>
            <p>以六相冰守护同伴，用反击回应每一次袭击。她是开拓旅途里最早握住你的那只手。</p>
            <footer>SHIELD THE MOMENT <span>✦</span></footer>
          </article>
          <article className="form-card hunt">
            <div className="form-top"><span>IMAGINARY</span><span>巡猎</span></div>
            <div className="relative -mx-7 mb-7 mt-6 h-80 overflow-hidden border-y border-current/10 bg-white/10">
              <img
                className="block h-full w-full object-contain object-bottom"
                src={imageUrl("image/illustration/xunlie.jpg", 720, 78)}
                srcSet={imageSrcSet("image/illustration/xunlie.jpg", [360, 540, 720, 960], 78)}
                sizes="(max-width: 680px) calc(100vw - 40px), (max-width: 980px) 88vw, 400px"
                alt="三月七巡猎形态立绘"
                loading="lazy"
                decoding="async"
              />
              <span className="absolute bottom-3 left-7 text-[96px] font-black leading-[.85] tracking-[-.1em] opacity-20" aria-hidden="true">02</span>
            </div>
            <h3>剑影里的新招式</h3>
            <p>拜师习剑，把每一场战斗也变成成长纪念。轻快、专注，依旧是熟悉的元气满满。</p>
            <footer>CAPTURE THE MOVE <span>↗</span></footer>
          </article>
          <article className="form-card evernight">
            <div className="form-top"><span>REMEMBRANCE</span><span>长夜月</span></div>
            <div className="relative -mx-7 mb-7 mt-6 h-80 overflow-hidden border-y border-current/10 bg-white/10">
              <img
                className="block h-full w-full object-contain object-bottom"
                src={imageUrl("image/illustration/jiyi.jpg", 720, 78)}
                srcSet={imageSrcSet("image/illustration/jiyi.jpg", [360, 540, 720, 960], 78)}
                sizes="(max-width: 680px) calc(100vw - 40px), (max-width: 980px) 88vw, 400px"
                alt="三月七记忆形态立绘"
                loading="lazy"
                decoding="async"
              />
              <span className="absolute bottom-3 left-7 text-[96px] font-black leading-[.85] tracking-[-.1em] opacity-20" aria-hidden="true">03</span>
            </div>
            <h3>记忆深处的月光</h3>
            <p>当明亮的底片翻到背面，夜色显露出另一种答案。神秘、沉静，却仍与「记忆」紧紧相连。</p>
            <footer>DEVELOP THE NIGHT <span>☾</span></footer>
          </article>
        </div>
      </section>

      <section className="quote-section">
        <p>“总之，先拍一张吧！”</p>
        <h2>下一站也要一起去，<br />下一张也要一起拍。</h2>
        <a href="#top">回到相簿开头 <span>↑</span></a>
      </section>

      <footer className="site-footer">
        <div className="brand"><span className="brand-mark">M7</span><span>March 7th</span></div>
        <p>献给星穹列车上最闪亮的摄影师。</p>
        <p className="disclaimer">© 2026 march7th.moe · All rights reserved · Powered by Cloudflare</p>
      </footer>
    </main>
  );
}
