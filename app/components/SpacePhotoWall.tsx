import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const CARD_COUNT = 15;
const ANGLE_STEP = 360 / CARD_COUNT;
// 浏览器屏幕坐标的 Y 轴向下，正 15° 才会形成左高右低的视觉轨迹。
const TILT_RADIANS = (15 * Math.PI) / 180;
// 自动旋转保持 50 秒一周，悬停只改变照片的视觉层级，不影响转速。
const AUTO_ROTATION_SPEED = 360 / 50_000;
const DRAG_SENSITIVITY = 0.11;
const PHOTO_SIZE_SCALE = 0.6;
const ORBIT_RADIUS_SCALE = 0.84;
const ENTRANCE_DURATION = 1_600;

type Photo = {
  id: number;
  file: string;
  alt: string;
  caption: string;
};

// 照片资源托管在对象存储；经由 Cloudflare Image Resizing 限宽、压缩并自动输出 WebP/AVIF 以节省流量。
const ASSET_HOST = "https://assets.march7th.moe";
const PHOTO_DIR = "image/PhotoWall";

const photoWallUrl = (file: string, width: number, quality: number) =>
  `${ASSET_HOST}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${PHOTO_DIR}/${file}`;

const photoWallSrcSet = (file: string, widths: number[], quality: number) =>
  widths.map((width) => `${photoWallUrl(file, width, quality)} ${width}w`).join(", ");

// 环形卡片实际渲染尺寸很小，用低分辨率缩略图即可；高清大图在 lightbox 打开时按需加载。
const THUMB_QUALITY = 72;
const THUMB_WIDTHS = [240, 360, 480];
const FULL_WIDTH = 1120;
const FULL_QUALITY = 86;

/** 照片集中维护；迁移对象存储后只需保证文件名与 PhotoWall 目录下一致。 */
const photos: Photo[] = [
  { id: 1, file: "a-star-that-lights-the-night.png", alt: "点亮夜色的星光纪念卡", caption: "A STAR THAT LIGHTS THE NIGHT" },
  { id: 2, file: "day-one-of-my-new-life.png", alt: "新生命第一天的旅途纪念卡", caption: "DAY ONE OF MY NEW LIFE" },
  { id: 3, file: "to-evernights-stars.png", alt: "献给长夜群星的纪念卡", caption: "TO EVERNIGHT'S STARS" },
  { id: 4, file: "brighter-than-the-sun.png", alt: "比太阳更明亮的纪念卡", caption: "BRIGHTER THAN THE SUN" },
  { id: 5, file: "only-silence-remains.png", alt: "唯有沉默的星际纪念卡", caption: "ONLY SILENCE REMAINS" },
  { id: 6, file: "poised-to-bloom.png", alt: "含苞待放的星际纪念卡", caption: "POISED TO BLOOM" },
  { id: 7, file: "night-on-the-milky-way.png", alt: "银河铁道之夜纪念卡", caption: "NIGHT ON THE MILKY WAY" },
  { id: 8, file: "this-is-me.png", alt: "这就是我主题纪念卡", caption: "THIS IS ME" },
  { id: 9, file: "race-to-the-horizon.png", alt: "奔向地平线的纪念卡", caption: "RACE TO THE HORIZON" },
  { id: 10, file: "in-the-name-of-the-world.png", alt: "以世界之名的纪念卡", caption: "IN THE NAME OF THE WORLD" },
  { id: 11, file: "tomorrow-together.png", alt: "相约明日的旅途纪念卡", caption: "TOMORROW TOGETHER" },
  { id: 12, file: "the-seriousness-of-breakfast.png", alt: "早餐的仪式感纪念卡", caption: "THE SERIOUSNESS OF BREAKFAST" },
  { id: 13, file: "though-worlds-apart.png", alt: "纵使世界相隔的纪念卡", caption: "THOUGH WORLDS APART" },
  { id: 14, file: "nowhere-to-run.png", alt: "无处可逃的星际纪念卡", caption: "NOWHERE TO RUN" },
  { id: 15, file: "the-great-cosmic-enterprise.png", alt: "寰宇商业计划纪念卡", caption: "THE GREAT COSMIC ENTERPRISE" },
];

type StarStyle = CSSProperties & Record<`--${string}`, string>;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createStars(count: number, seed: number, size: [number, number]) {
  const random = seededRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    id: `${seed}-${index}`,
    style: {
      "--star-x": `${(random() * 100).toFixed(2)}%`,
      "--star-y": `${(random() * 100).toFixed(2)}%`,
      "--star-size": `${(size[0] + random() * (size[1] - size[0])).toFixed(2)}px`,
      "--star-opacity": `${(0.2 + random() * 0.72).toFixed(2)}`,
      "--twinkle-duration": `${(3.8 + random() * 7.2).toFixed(2)}s`,
      "--twinkle-delay": `${(-random() * 9).toFixed(2)}s`,
    } as StarStyle,
  }));
}

const distantStars = createStars(120, 307, [0.55, 1.25]);
const middleStars = createStars(38, 815, [1.05, 2.05]);
const brightStars = createStars(9, 1207, [1.8, 3]);

function StarField({ className, stars }: { className: string; stars: ReturnType<typeof createStars> }) {
  return (
    <div className={`star-field ${className}`} aria-hidden="true">
      {stars.map((star) => <i key={star.id} style={star.style} />)}
    </div>
  );
}

function SpaceBackground() {
  return (
    <div className="space-background" aria-hidden="true">
      <div className="nebula nebula-indigo" />
      <div className="nebula nebula-blue" />
      <div className="nebula nebula-violet" />
      <StarField className="stars-distant" stars={distantStars} />
      <StarField className="stars-middle" stars={middleStars} />
      <StarField className="stars-bright" stars={brightStars} />
      <div className="cosmic-vignette" />
      <div className="film-grain" />
    </div>
  );
}

type PhotoCardProps = {
  photo: Photo;
  index: number;
  setPositionRef: (index: number, node: HTMLDivElement | null) => void;
  setVisualRef: (index: number, node: HTMLButtonElement | null) => void;
  onOpen: (photo: Photo, trigger: HTMLButtonElement) => void;
};

function PhotoCard({ photo, index, setPositionRef, setVisualRef, onOpen }: PhotoCardProps) {
  return (
    <div className="photo-position" ref={(node) => setPositionRef(index, node)}>
      <button
        className="photo-card"
        ref={(node) => setVisualRef(index, node)}
        type="button"
        aria-label={`查看大图：${photo.alt}`}
        onClick={(event) => onOpen(photo, event.currentTarget)}
      >
        <span className="photo-face photo-front">
          <img
            src={photoWallUrl(photo.file, THUMB_WIDTHS[1], THUMB_QUALITY)}
            srcSet={photoWallSrcSet(photo.file, THUMB_WIDTHS, THUMB_QUALITY)}
            sizes="240px"
            alt={photo.alt}
            draggable="false"
            decoding="async"
          />
        </span>
        <span className="photo-face photo-back" aria-hidden="true">
          <span className="photo-back-label">
            <strong>时光回廊</strong>
            <small>MEMORY ARCHIVE · NO. {String(photo.id).padStart(2, "0")}</small>
          </span>
        </span>
      </button>
    </div>
  );
}

function PhotoLightbox({ photo, onClose }: { photo: Photo | null; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!photo) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, onClose]);

  if (!photo) return null;

  const keepFocusInside = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    closeButtonRef.current?.focus();
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={keepFocusInside}
    >
      <div className="lightbox-glow" aria-hidden="true" />
      <figure className="lightbox-figure">
        <img src={photoWallUrl(photo.file, FULL_WIDTH, FULL_QUALITY)} alt={photo.alt} />
        <figcaption>
          <span>{String(photo.id).padStart(2, "0")} / {CARD_COUNT}</span>
          <strong>{photo.caption}</strong>
        </figcaption>
      </figure>
      <button className="lightbox-close" ref={closeButtonRef} type="button" aria-label="关闭大图" onClick={onClose}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
    </div>
  );
}

function Carousel3D() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const positionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visualRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const radiusRef = useRef(620);
  const angleRef = useRef(0);
  const inertiaSpeedRef = useRef(0);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    lastX: 0,
    lastTime: 0,
    moved: false,
  });
  const suppressClickUntilRef = useRef(0);
  const lightboxOpenRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const setPositionRef = (index: number, node: HTMLDivElement | null) => {
    positionRefs.current[index] = node;
  };
  const setVisualRef = (index: number, node: HTMLButtonElement | null) => {
    visualRefs.current[index] = node;
  };

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => { reducedMotionRef.current = motionQuery.matches; };
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const updateMeasurements = () => {
      const width = scene.clientWidth;
      const height = scene.clientHeight;
      const compact = width < 680;
      const baseCardWidth = compact
        ? Math.min(104, Math.max(78, width * 0.235))
        : Math.min(198, Math.max(132, width * 0.115));
      const baseCardHeight = baseCardWidth * (1220 / 864);
      const cardWidth = baseCardWidth * PHOTO_SIZE_SCALE;
      const cardHeight = cardWidth * (1220 / 864);
      const widthRadius = compact
        ? Math.min(250, Math.max(188, width * 0.62))
        : Math.min(720, Math.max(390, width * 0.36));
      // 环形半径仍按原始照片尺寸计算，缩小照片不会意外放大整条轨道。
      const heightRadius = Math.max(180, (height - baseCardHeight) / (2 * Math.sin(Math.abs(TILT_RADIANS)) + 0.3));
      const radius = Math.min(widthRadius, heightRadius) * ORBIT_RADIUS_SCALE;

      radiusRef.current = radius;
      scene.style.setProperty("--card-width", `${cardWidth.toFixed(2)}px`);
      scene.style.setProperty("--card-height", `${cardHeight.toFixed(2)}px`);
      scene.style.setProperty("--scene-perspective", `${Math.max(850, radius * 2.15).toFixed(0)}px`);
    };

    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(scene);
    updateMeasurements();

    let frameId = 0;
    let lastTime = performance.now();
    const entranceStartTime = lastTime;
    const renderFrame = (time: number) => {
      const delta = Math.min(time - lastTime, 50);
      lastTime = time;

      if (!reducedMotionRef.current && !lightboxOpenRef.current && !dragRef.current.active) {
        // 拖拽释放后保留短暂惯性，同时始终叠加 50 秒一周的基础转速。
        angleRef.current = (angleRef.current + (AUTO_ROTATION_SPEED + inertiaSpeedRef.current) * delta) % 360;
        inertiaSpeedRef.current *= Math.exp(-delta / 720);
        if (Math.abs(inertiaSpeedRef.current) < 0.0001) inertiaSpeedRef.current = 0;
      }

      const radius = radiusRef.current;
      const entranceProgress = reducedMotionRef.current
        ? 1
        : Math.min(Math.max((time - entranceStartTime) / ENTRANCE_DURATION, 0), 1);
      // 首屏中整条轨道从圆心向外舒展，三次缓出让末段自然收住。
      const spreadProgress = 1 - Math.pow(1 - entranceProgress, 3);
      const animatedRadius = radius * spreadProgress;
      const tiltCos = Math.cos(TILT_RADIANS);
      const tiltSin = Math.sin(TILT_RADIANS);
      positionRefs.current.forEach((position, index) => {
        const visual = visualRefs.current[index];
        if (!position || !visual) return;

        const theta = angleRef.current + index * ANGLE_STEP;
        const radians = (theta * Math.PI) / 180;
        const ringX = animatedRadius * Math.sin(radians);
        const z = animatedRadius * Math.cos(radians);
        // 只倾斜卡片中心坐标；卡片自身只做 rotateY，始终保持世界空间竖直。
        const x = ringX * tiltCos;
        const y = ringX * tiltSin;
        const depth = (z + radius) / (2 * radius);

        position.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${theta.toFixed(3)}deg)`;
        position.style.opacity = Math.min(entranceProgress * 1.55, 1).toFixed(3);
        position.style.zIndex = String(Math.round(depth * 1000));
        visual.style.setProperty("--card-opacity", (0.42 + depth * 0.58).toFixed(3));
        visual.style.setProperty("--depth-scale", (0.94 + depth * 0.1).toFixed(3));
        visual.style.setProperty("--card-brightness", (0.56 + depth * 0.48).toFixed(3));
        visual.style.setProperty("--card-contrast", (0.92 + depth * 0.12).toFixed(3));
        visual.style.setProperty("--shadow-alpha", (0.12 + depth * 0.32).toFixed(3));
      });

      scene.classList.add("is-ready");
      frameId = requestAnimationFrame(renderFrame);
    };
    frameId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  const openLightbox = (photo: Photo, trigger: HTMLButtonElement) => {
    // 拖拽结束时浏览器仍可能派发 click；这一小段保护避免误开大图。
    if (performance.now() < suppressClickUntilRef.current) return;
    openerRef.current = trigger;
    lightboxOpenRef.current = true;
    setSelectedPhoto(photo);
  };
  const closeLightbox = () => {
    lightboxOpenRef.current = false;
    setSelectedPhoto(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || lightboxOpenRef.current) return;

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      moved: false,
    };
    inertiaSpeedRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const now = performance.now();
    const deltaX = event.clientX - drag.lastX;
    const deltaTime = Math.max(now - drag.lastTime, 8);
    const angleDelta = deltaX * DRAG_SENSITIVITY;

    angleRef.current = (angleRef.current + angleDelta) % 360;
    inertiaSpeedRef.current = Math.max(-0.42, Math.min(0.42, angleDelta / deltaTime));
    drag.lastX = event.clientX;
    drag.lastTime = now;
    if (Math.abs(event.clientX - drag.startX) > 5) drag.moved = true;
    if (drag.moved) event.preventDefault();
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    drag.active = false;
    if (drag.moved) suppressClickUntilRef.current = performance.now() + 180;
    if (reducedMotionRef.current) inertiaSpeedRef.current = 0;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove("is-dragging");
  };

  return (
    <>
      <div
        className="carousel-scene"
        ref={sceneRef}
        aria-label="时光回廊照片环，可左右拖动旋转"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div className="orbit-ambient" aria-hidden="true" />
        <div className="orbit-guide" aria-hidden="true" />
        <div className="photo-ring">
          {photos.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} setPositionRef={setPositionRef} setVisualRef={setVisualRef} onOpen={openLightbox} />
          ))}
        </div>
      </div>
      <PhotoLightbox photo={selectedPhoto} onClose={closeLightbox} />
    </>
  );
}

export default function SpacePhotoWall() {
  useEffect(() => {
    const previousTitle = document.title;
    document.documentElement.classList.add("space-wall-active");
    document.title = "时光回廊｜三月七";
    return () => {
      document.documentElement.classList.remove("space-wall-active");
      document.title = previousTitle;
    };
  }, []);

  return (
    <main aria-label="时光回廊">
      <div className="space-photo-wall">
        <SpaceBackground />
        <div className="archive-mark" aria-hidden="true">
          <span>时光回廊</span><i /><span>NO. 0307</span>
        </div>
        <a className="wall-home-link" href="/">RETURN HOME <span aria-hidden="true">↗</span></a>
        <Carousel3D />
        <div className="wall-caption">
          <p>把今天，留在星轨之间。</p>
          <span>角色档案 · 15 FRAGMENTS IN ORBIT</span>
        </div>
        <p className="wall-instruction">DRAG TO ROTATE · HOVER TO DRAW OUT · CLICK TO REMEMBER</p>
      </div>
    </main>
  );
}
