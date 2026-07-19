import React, { useRef, useEffect } from "react";
import anime from "animejs";
import "./FuzzyText.css";

/**
 * FuzzyText — 404-style jittery "glitch" text using SVG turbulence filter.
 * Hover intensifies the distortion.
 */
export default function FuzzyText({
  children = "404",
  baseIntensity = 0.15,
  hoverIntensity = 0.4,
  enableHover = true,
  color = "#fff",
  fontSize = "clamp(5rem, 20vw, 12rem)",
  fontWeight = 900,
}) {
  const turbRef = useRef(null);
  const wrapRef = useRef(null);
  const uid = React.useId();

  useEffect(() => {
    if (!turbRef.current) return;
    let raf;
    let seed = 0;
    function tick() {
      seed += baseIntensity * 0.2;
      turbRef.current?.setAttribute("seed", String(seed));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [baseIntensity]);

  function onEnter() {
    if (!enableHover || !turbRef.current) return;
    anime({
      targets: wrapRef.current,
      scale: 1.05,
      duration: 300,
      easing: "easeOutBack",
    });
  }
  function onLeave() {
    if (!enableHover) return;
    anime({
      targets: wrapRef.current,
      scale: 1,
      duration: 300,
      easing: "easeOutBack",
    });
  }

  return (
    <div
      ref={wrapRef}
      className="fuzzy-wrap"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ color }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={`fuzz-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseIntensity * 0.08}
              numOctaves="2"
              seed="1"
              ref={turbRef}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={hoverIntensity * 18 + 8} />
          </filter>
        </defs>
      </svg>
      <span
        className="fuzzy-text"
        style={{
          fontSize,
          fontWeight,
          filter: `url(#fuzz-${uid})`,
        }}
      >
        {children}
      </span>
    </div>
  );
}
