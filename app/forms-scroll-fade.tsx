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
      const grid = root?.querySelector<HTMLElement>(".forms-grid");
      if (!root || !grid) return;

      const cards = gsap.utils.toArray<HTMLElement>(".form-card", grid);
      if (!cards.length) return;

      const ctx = gsap.context(() => {
        gsap.set(cards, { autoAlpha: 0 });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: grid,
            start: "top 96%",
            end: "top 48%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(cards[0], { autoAlpha: 1, duration: 1 }, 0)
          .to(cards[1], { autoAlpha: 1, duration: 1 }, 0.7)
          .to(cards[2], { autoAlpha: 1, duration: 1 }, 1.4);
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
