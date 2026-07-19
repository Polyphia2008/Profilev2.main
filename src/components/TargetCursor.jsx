import React, { useEffect, useState, useRef } from "react";
import "./TargetCursor.css";

/**
 * reactbits-inspired TargetCursor
 * - Custom white circle cursor that follows mouse with smooth lerp
 * - Spins a rotating ring around it
 * - Parallax tilt on hoverable targets
 * - Changes color when hovering a .cursor-target
 */
export default function TargetCursor({
  spinDuration = 3,
  hideDefaultCursor = true,
  parallaxOn = true,
  hoverDuration = 0.2,
  cursorColor = "#ffffff",
  cursorColorOnTarget = "#22c55e",
} = {}) {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [visible, setVisible] = useState(false);
  const posRef = useRef({ mx: window.innerWidth / 2, my: window.innerHeight / 2, tx: 0, ty: 0, raf: null });

  useEffect(() => {
    // Detect touch device -> disable custom cursor
    if (matchMedia?.("(pointer: coarse)").matches) return;
    if (hideDefaultCursor) document.body.style.cursor = "none";

    const pos = posRef.current;
    pos.tx = pos.mx;
    pos.ty = pos.my;

    function onMove(e) {
      pos.mx = e.clientX;
      pos.my = e.clientY;
      setVisible(true);
      // find hover target
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isTarget = el?.closest?.("a, button, .cursor-target, [role='link'], input, textarea");
      setIsOnTarget(!!isTarget);
    }
    function onLeave() { setVisible(false); }
    function onEnter() { setVisible(true); }

    function loop() {
      // Lerp towards mouse
      pos.tx += (pos.mx - pos.tx) * 0.22;
      pos.ty += (pos.my - pos.ty) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.tx}px, ${pos.ty}px) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.mx}px, ${pos.my}px) translate(-50%, -50%)`;
      }
      pos.raf = requestAnimationFrame(loop);
    }
    pos.raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(pos.raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (hideDefaultCursor) document.body.style.cursor = "";
    };
  }, [hideDefaultCursor]);

  if (matchMedia?.("(pointer: coarse)").matches) return null;

  return (
    <div className={`tc-root ${visible ? "visible" : ""}`} aria-hidden="true">
      <div
        ref={ringRef}
        className={`tc-ring ${isOnTarget ? "on-target" : ""}`}
        style={{
          borderColor: isOnTarget ? cursorColorOnTarget : cursorColor,
          animationDuration: `${spinDuration}s`,
          transition: `width ${hoverDuration}s, height ${hoverDuration}s, border-color 0.2s`,
        }}
      />
      <div
        ref={dotRef}
        className={`tc-dot ${isOnTarget ? "on-target" : ""}`}
        style={{
          background: isOnTarget ? cursorColorOnTarget : cursorColor,
          transition: `width ${hoverDuration}s, height ${hoverDuration}s, background 0.2s`,
        }}
      />
    </div>
  );
}
