"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PHOTO_SRC = "https://assets.march7th.moe/cdn-cgi/image/width=1800,quality=86,format=auto/image/backgrounds/hezhao.png";

export default function HeroPhotoEnhancer() {
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const frame = document.querySelector<HTMLElement>(".visual-frame");
    if (!frame) return;

    frame.classList.add("hero-photo-trigger");
    frame.setAttribute("role", "button");
    frame.setAttribute("tabindex", "0");
    frame.setAttribute("aria-label", "放大查看列车组合照");

    const show = () => {
      setFlipped(false);
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        show();
      }
    };

    frame.addEventListener("click", show);
    frame.addEventListener("keydown", onKeyDown);

    return () => {
      frame.removeEventListener("click", show);
      frame.removeEventListener("keydown", onKeyDown);
      frame.classList.remove("hero-photo-trigger");
      frame.removeAttribute("role");
      frame.removeAttribute("tabindex");
      frame.removeAttribute("aria-label");
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 10;
    const rotateX = (0.5 - y) * 8;

    card.style.setProperty("--photo-rx", `${rotateX}deg`);
    card.style.setProperty("--photo-ry", `${rotateY}deg`);
    card.style.setProperty("--shine-x", `${x * 100}%`);
    card.style.setProperty("--shine-y", `${y * 100}%`);
  };

  const resetTilt = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--photo-rx", "0deg");
    card.style.setProperty("--photo-ry", "0deg");
    card.style.setProperty("--shine-x", "50%");
    card.style.setProperty("--shine-y", "35%");
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="hero-photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="列车组合照 3D 查看器"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <button className="photo-lightbox-close" type="button" onClick={() => setOpen(false)} aria-label="关闭照片查看器">×</button>

      <div className="photo-stage">
        <div
          ref={cardRef}
          className={`photo-tilt-shell${flipped ? " is-flipped" : ""}`}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
        >
          <div className="photo-3d-card">
            <div className="photo-face photo-front">
              <img src={PHOTO_SRC} alt="星穹列车成员在庆典街景前的集体合影" draggable={false} />
              <span className="photo-laminate" aria-hidden="true" />
              <span className="photo-edge-highlight" aria-hidden="true" />
            </div>
            <div className="photo-face photo-back" aria-label="照片背面">
              <div className="photo-back-mark">M7 · MEMORY PRINT</div>
              <div className="photo-back-lines" aria-hidden="true"><i /><i /><i /></div>
              <span className="photo-signature">March7th</span>
            </div>
          </div>
        </div>

        <div className="photo-viewer-controls">
          <button type="button" onClick={() => setFlipped((value) => !value)}>
            {flipped ? "查看正面" : "翻到背面"}
            <span aria-hidden="true">↻</span>
          </button>
          <p>移动鼠标查看塑封反光 · Esc 关闭</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
