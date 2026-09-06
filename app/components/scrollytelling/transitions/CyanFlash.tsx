import { useScrollyConfig } from "../ScrollyConfigContext";
export default function CyanFlash() {
  const { layout, motion } = useScrollyConfig();
  const radius = layout.referenceWidth * motion.flashRadius;
  return <svg className="scrolly-transition cyan-flash" viewBox={`0 0 ${layout.referenceWidth} ${layout.referenceHeight}`} aria-hidden="true">
    <circle cx={layout.referenceWidth} cy={layout.referenceHeight / 2} r={radius} fill="none"
      stroke="var(--scrolly-transition-cyan)" strokeWidth={radius * motion.flashStrokeRatio} />
  </svg>;
}
