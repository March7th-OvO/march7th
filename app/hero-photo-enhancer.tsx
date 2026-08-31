import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PHOTO_SRC = "https://assets.march7th.moe/cdn-cgi/image/width=1800,quality=86,format=auto/image/backgrounds/hezhao.png";
const MAX_ROTATE_X = 16;
const MAX_ROTATE_Y = 22;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function HeroPhotoEnhancer() {
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, rotateX: 0, rotateY: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
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

  const applyRotation = (rotateX: number, rotateY: number) => {
    const card = cardRef.current;
    if (!card) return;

    rotationRef.current = { x: rotateX, y: rotateY };

    // 高光位置与强度由照片旋转角度推导，不再直接跟随鼠标位置。
    const shineX = 50 + (rotateY / MAX_ROTATE_Y) * 30;
    const shineY = 50 - (rotateX / MAX_ROTATE_X) * 30;
    const tiltProgress = Math.min(
      1,
      Math.hypot(rotateX / MAX_ROTATE_X, rotateY / MAX_ROTATE_Y),
    );

    card.style.setProperty("--photo-rx", `${rotateX}deg`);
    card.style.setProperty("--photo-ry", `${rotateY}deg`);
    card.style.setProperty("--shine-x", `${shineX}%`);
    card.style.setProperty("--shine-y", `${shineY}%`);
    card.style.setProperty("--shine-opacity", `${0.35 + tiltProgress * 0.6}`);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      (event.pointerType === "mouse" && event.button !== 0)
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    activePointerIdRef.current = event.pointerId;
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      rotateX: rotationRef.current.x,
      rotateY: rotationRef.current.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const deltaX = event.clientX - dragStartRef.current.pointerX;
    const deltaY = event.clientY - dragStartRef.current.pointerY;
    const rotateX = clamp(
      dragStartRef.current.rotateX - (deltaY / rect.height) * MAX_ROTATE_X * 2,
      -MAX_ROTATE_X,
      MAX_ROTATE_X,
    );
    const rotateY = clamp(
      dragStartRef.current.rotateY + (deltaX / rect.width) * MAX_ROTATE_Y * 2,
      -MAX_ROTATE_Y,
      MAX_ROTATE_Y,
    );

    applyRotation(rotateX, rotateY);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    activePointerIdRef.current = null;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!open) return null;

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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onLostPointerCapture={finishDrag}
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
          <p>按住并拖动照片以旋转和查看高光 · Esc 关闭</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
