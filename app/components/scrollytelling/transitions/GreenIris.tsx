import { useId } from "react";
import { useScrollyConfig } from "../ScrollyConfigContext";
export default function GreenIris() {
  const maskId = useId();
  const { layout: { referenceWidth: width, referenceHeight: height }, motion } = useScrollyConfig();
  const cx = width * motion.irisX, cy = height * motion.irisY;
  // 单一遮罩：白圆定义覆盖范围，黑圆挖孔；没有实心底圆挡住 aperture。
  return <svg className="scrolly-transition green-iris" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
      <rect width={width} height={height} fill="black" />
      <circle className="green-iris-cover" cx={cx} cy={cy} r="0" fill="white" />
      <circle className="green-iris-aperture" cx={cx} cy={cy} r="0" fill="black" />
    </mask></defs>
    <rect width={width} height={height} fill="var(--scrolly-decorative-purple)" mask={`url(#${maskId})`} />
  </svg>;
}
