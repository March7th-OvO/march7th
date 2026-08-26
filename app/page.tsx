"use client";

import { useEffect, useRef, useState } from "react";

const journeyStages = [
  {
    place: "六相冰",
    title: "被列车捡到的那一天",
    text: "星穹列车在寂静宇宙中发现了一块漂流的六相冰。冰里的少女忘记了姓名与来处，于是把重获新生的日期，写成了自己的名字。",
    memory: "三月七。先记住今天，昨天以后再说。",
    symbol: "冰",
    tone: "ice",
  },
  {
    place: "黑塔空间站",
    title: "第一次成为你的向导",
    text: "反物质军团突袭空间站，她和丹恒在混乱中找到了刚刚醒来的开拓者。这里既是故事的序章，也是列车新同伴第一次并肩作战的地方。",
    memory: "站稳啦，接下来就跟紧本姑娘。",
    symbol: "序",
    tone: "station",
  },
  {
    place: "贝洛伯格",
    title: "把风雪留在相片里",
    text: "在被永冬包围的雅利洛-VI，三月七与同伴穿过上下层区，见证贝洛伯格重新选择未来。雪原很冷，但这趟开拓之旅第一次有了家的温度。",
    memory: "这么大的雪，当然要多拍几张。",
    symbol: "雪",
    tone: "belobog",
  },
  {
    place: "仙舟「罗浮」",
    title: "云海之外，也有旧梦",
    text: "列车因一封讯息驶向仙舟，在星核危机与幻胧之乱中和罗浮并肩。后来，她又在这里追索自己的记忆、拜师习剑，把未知练成了新的招式。",
    memory: "过去没想起来，剑倒是学会了。",
    symbol: "剑",
    tone: "luofu",
  },
  {
    place: "匹诺康尼",
    title: "美梦也要按下快门",
    text: "盛会之星的邀请，把列车带进层层梦境。三月七与伙伴追随钟表匠留下的路，在真假交叠的美梦中，见证匹诺康尼重新听见自由的声音。",
    memory: "美梦终会醒，但照片里的大家不会消失。",
    symbol: "梦",
    tone: "penacony",
  },
  {
    place: "翁法洛斯",
    title: "记忆终于追上了她",
    text: "列车抵达永恒之地门外，三月七却因突如其来的异变暂别同行者。六相冰、长夜与被封存的往事在这里重新相遇，她的故事翻到了最接近答案的一页。",
    memory: "无论记起什么，我都还是我。",
    symbol: "夜",
    tone: "amphoreus",
  },
  {
    place: "下一站",
    title: "三月七的旅途还在继续~",
    text: "相机里还有空白，星轨前方也还有无数没有抵达的世界。答案不必在今天全部找到——只要列车继续前进，新的回忆就会不断显影。",
    memory: "准备好了吗？这次也要一起拍。",
    symbol: "∞",
    tone: "future",
  },
];

export default function Home() {
  const [activeProfileCard, setActiveProfileCard] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const journeyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initGsap = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      const root = journeyRef.current;
      if (!root) return;

      const pinWindow = root.querySelector<HTMLElement>(".journey-pin");
      const panels = gsap.utils.toArray<HTMLElement>(".journey-panel", root);
      const routeStops = gsap.utils.toArray<HTMLElement>(".journey-route-stop", root);
      const progressFill = root.querySelector<HTMLElement>(".journey-progress-fill");

      if (!pinWindow || panels.length < 2 || !progressFill) return;

      const ctx = gsap.context(() => {
        gsap.set(panels.slice(1), { yPercent: 108, scale: 0.86, opacity: 0.18 });
        gsap.set(routeStops.slice(1), { opacity: 0.28 });
        gsap.set(progressFill, { scaleY: 0, transformOrigin: "top center" });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinWindow,
            start: "top top",
            end: () => `+=${window.innerHeight * (panels.length - 1)}`,
            pin: true,
            scrub: 0.85,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 每次滚动推进一格：旧底片向上缩暗，新底片从窗口底部完成显影。
        panels.slice(1).forEach((panel, panelIndex) => {
          const previousPanel = panels[panelIndex];
          const routeStop = routeStops[panelIndex + 1];
          const at = panelIndex;

          timeline
            .to(previousPanel, {
              yPercent: -14,
              scale: 0.88,
              opacity: 0.12,
              filter: "blur(10px)",
              duration: 0.48,
            }, at)
            .to(panel, {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              duration: 0.72,
            }, at)
            .to(routeStop, { opacity: 1, duration: 0.18 }, at + 0.46);
        });

        timeline.to(progressFill, { scaleY: 1, duration: panels.length - 1 }, 0);
      }, root);

      cleanup = () => ctx.revert();
    };

    void initGsap();

    return () => cleanup?.();
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
              src="/train-group.webp"
              alt="星穹列车成员在庆典街景前的集体合影"
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

      <section className="journey-section" id="memories" ref={journeyRef}>
        <div className="journey-pin">
          <div className="journey-heading">
            <p>沿着星轨，向下翻阅</p>
            <span>SCROLL TO DEVELOP</span>
          </div>

          <div className="journey-route" aria-hidden="true">
            <div className="journey-progress-track">
              <i className="journey-progress-fill" />
            </div>
            {journeyStages.map((stage) => (
              <div className="journey-route-stop" key={stage.place}>
                <i />
                <span>{stage.place}</span>
              </div>
            ))}
          </div>

          <div className="journey-window" aria-label="三月七的旅途时间轴">
            {journeyStages.map((stage, index) => (
              <article
                className="journey-panel"
                data-tone={stage.tone}
                key={stage.place}
                style={{ zIndex: index + 1 }}
              >
                <div className="journey-panel-copy">
                  <div className="journey-place">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{stage.place}</p>
                  </div>
                  <h2>{stage.title}</h2>
                  <p className="journey-description">{stage.text}</p>
                  <blockquote>{stage.memory}</blockquote>
                </div>
                <div className="journey-visual" aria-hidden="true">
                  <div className="journey-orbit orbit-outer" />
                  <div className="journey-orbit orbit-inner" />
                  <span>{stage.symbol}</span>
                  <p>MARCH 7TH<br />MEMORY ARCHIVE</p>
                </div>
              </article>
            ))}
          </div>

          <p className="journey-instruction">继续向下滚动 <span>↓</span></p>
        </div>
      </section>

      <section className="forms-section" id="forms">
        <div className="section-heading compact">
          <p className="eyebrow">THREE FRAMES / 旅途剪影</p>
          <h2>同一个她，<span>三种光芒。</span></h2>
        </div>
        <div className="forms-grid">
          <article className="form-card preservation">
            <div className="form-top"><span>ICE</span><span>存护</span></div>
            <div className="form-number">01</div>
            <h3>最初的三月七</h3>
            <p>以六相冰守护同伴，用反击回应每一次袭击。她是开拓旅途里最早握住你的那只手。</p>
            <footer>SHIELD THE MOMENT <span>✦</span></footer>
          </article>
          <article className="form-card hunt">
            <div className="form-top"><span>IMAGINARY</span><span>巡猎</span></div>
            <div className="form-number">02</div>
            <h3>剑影里的新招式</h3>
            <p>拜师习剑，把每一场战斗也变成成长纪念。轻快、专注，依旧是熟悉的元气满满。</p>
            <footer>CAPTURE THE MOVE <span>↗</span></footer>
          </article>
          <article className="form-card evernight">
            <div className="form-top"><span>REMEMBRANCE</span><span>长夜月</span></div>
            <div className="form-number">03</div>
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
