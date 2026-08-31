"use client";

import { useEffect } from "react";

export default function FormsScrollFade() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const root = document.querySelector<HTMLElement>(".forms-section");
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>(".form-card", root);
      if (!cards.length) return;

      const ctx = gsap.context(() => {
        cards.forEach((card, index) => {
          const startPercent = 90 - index * 5;
          const endPercent = 62 - index * 5;

          gsap.fromTo(card, { autoAlpha: 0 }, {
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: `top ${startPercent}%`,
              end: `top ${endPercent}%`,
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          });
        });
      }, root);

      cleanup = () => ctx.revert();
    };

    void init();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return null;
}
