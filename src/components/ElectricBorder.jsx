import React, { useRef, useEffect } from "react";
import "./ElectricBorder.css";

/**
 * ElectricBorder — wrapper that draws a glowing animated electric border via SVG filter turbulence,
 * producing a lightning-like animated gradient stroke.
 */
export default function ElectricBorder({
  color = "#7df9ff",
  speed = 1,
  chaos = 0.5,
  thickness = 2,
  children,
  className = "",
  style = {},
  borderRadius = 16,
}) {
  const ref = useRef(null);
  const filterRef = useRef(null);
  const turbulenceRef = useRef(null);

  useEffect(() => {
    if (!turbulenceRef.current) return;
    let raf;
    let seed = 0;
    const baseFreq = 0.015 + chaos * 0.04;
    const numOct = Math.floor(2 + chaos * 2);
    const animSpeed = 0.008 * speed;
    turbulenceRef.current.setAttribute("baseFrequency", baseFreq);
    turbulenceRef.current.setAttribute("numOctaves", String(numOct));

    function tick() {
      seed += animSpeed;
      turbulenceRef.current.setAttribute("seed", String(seed));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chaos, speed]);

  const uid = useId();

  return (
    <div
      ref={ref}
      className={`electric-border ${className}`}
      style={{ borderRadius, ...style }}
    >
      <svg
        className="electric-svg"
        style={{ borderRadius }}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`electric-turb-${uid}`} ref={filterRef} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="3"
              seed="1"
              result="noise"
              ref={turbulenceRef}
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={4 + chaos * 6} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <rect
          x={thickness / 2}
          y={thickness / 2}
          width="calc(100% - "
          height="100%"
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          filter={`url(#electric-turb-${uid})`}
          pathLength="100"
          strokeDasharray="100"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;-200"
            dur={`${8 / speed}s`}
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x={thickness / 2}
          y={thickness / 2}
          width="100%"
          height="100%"
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth={thickness * 0.6}
          opacity="0.4"
          filter={`url(#electric-turb-${uid})`}
        />
      </svg>
      <div className="electric-content" style={{ borderRadius }}>{children}</div>
    </div>
  );
}

// Simple stable uid without importing react's useId (works on react 18+)
let idCounter = 0;
function useId() {
  const ref = React.useRef(`eb-${++idCounter}`);
  return ref.current;
}
