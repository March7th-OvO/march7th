"use client";

import { useEffect, useState } from "react";

const memories = [
  {
    stamp: "03 / 07",
    title: "从冰中醒来",
    text: "被星穹列车发现的那天，成为了她的新名字。过去仍被封存在六相冰里，但今天已经有了同行的人。",
    accent: "ICE FILE · 001",
  },
  {
    stamp: "CLICK!",
    title: "把每一站拍下来",
    text: "她用相机收藏旅途：贝洛伯格的雪、仙舟的云、匹诺康尼的梦，还有镜头之外那些吵吵闹闹的同伴。",
    accent: "PHOTO LOG · 037",
  },
  {
    stamp: "NEXT →",
    title: "向未知出发",
    text: "答案也许还在更远的星海。比起追问昨天，她更愿意先举起相机，和大家一起走向下一站。",
    accent: "TRAILBLAZE · ∞",
  },
];

export default function Home() {
  const [activeMemory, setActiveMemory] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
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
          <a href="#memories" onClick={() => setMenuOpen(false)}>记忆相簿</a>
          <a href="#forms" onClick={() => setMenuOpen(false)}>旅途剪影</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">ASTRAL EXPRESS · PASSENGER NO. 7</p>
          <h1>
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

        <div className="profile-grid">
          <article className="profile-card intro-card">
            <span className="card-index">01</span>
            <p>「咱可不是什么神秘人物，只是个热爱拍照、偶尔会把事情搞砸的普通列车乘客啦！」</p>
            <footer><span>个性</span><strong>明快 · 真诚 · 好奇</strong></footer>
          </article>
          <article className="profile-card ice-card">
            <span className="card-index">02</span>
            <div className="ice-symbol" aria-hidden="true">✦</div>
            <footer><span>记忆起点</span><strong>六相冰</strong></footer>
          </article>
          <article className="profile-card camera-card">
            <span className="card-index">03</span>
            <div className="camera-copy">
              <small>PHOTO COUNT</small>
              <strong>∞</strong>
              <p>照片不会忘记，<br />所以她负责按下快门。</p>
            </div>
          </article>
        </div>
      </section>

      <section className="memory-section" id="memories">
        <div className="memory-stage">
          <div className="memory-counter">
            <span>0{activeMemory + 1}</span>
            <i />
            <span>0{memories.length}</span>
          </div>
          <div className="memory-copy" aria-live="polite">
            <p>{memories[activeMemory].accent}</p>
            <h2>{memories[activeMemory].title}</h2>
            <div className="memory-stamp">{memories[activeMemory].stamp}</div>
            <p className="memory-text">{memories[activeMemory].text}</p>
          </div>
          <div className="memory-controls" aria-label="切换记忆卡片">
            {memories.map((memory, index) => (
              <button
                key={memory.title}
                className={index === activeMemory ? "active" : ""}
                type="button"
                aria-label={`查看：${memory.title}`}
                aria-current={index === activeMemory}
                onClick={() => setActiveMemory(index)}
              >
                <span>0{index + 1}</span>{memory.title}
              </button>
            ))}
          </div>
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
        <p className="disclaimer">非官方角色纪念站 · Honkai: Star Rail 及相关角色版权归其权利方所有</p>
      </footer>
    </main>
  );
}
