import { useScrollyConfig } from "../ScrollyConfigContext";
export default function CyanTransition() {
  const { layout, motion } = useScrollyConfig();
  const radius = layout.referenceWidth * motion.cyanRadius;
  return <div className="scrolly-transition cyan-transition" aria-hidden="true">
    <div className="cyan-surface" style={{ width: radius * 2, height: radius * 2,
      left: layout.referenceWidth * motion.cyanX - radius, top: layout.referenceHeight * motion.cyanY - radius }} />
  </div>;
}
