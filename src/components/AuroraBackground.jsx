import React, { useEffect, useRef } from "react";
import anime from "animejs";
import "./AuroraBackground.css";

/**
 * Reactbits-inspired Aurora/Shapes/Beam background:
 * - Animated multi-color blobs drifting & morphing
 * - "Grid pattern" / beams overlay
 * - Subtle stars/particles drifting
 */
export default function AuroraBackground() {
  const containerRef = useRef(null);
  const particlesRef = useRef(null);
  const blobsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Spawn particles (stars) ---
    const PARTICLE_COUNT = 40;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement("div");
      p.className = "aurora-particle";
      const size = Math.random() * 2 + 1;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.opacity = Math.random() * 0.7 + 0.2;
      p.style.animationDuration = `${3 + Math.random() * 5}s`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      particlesRef.current.appendChild(p);
      particles.push(p);
    }

    // --- Drive blob animation with anime.js (loop) ---
    const blobs = blobsRef.current;
    function animateBlob(blob, baseX, baseY, r) {
      anime({
        targets: blob,
        translateX: [
          { value: baseX + (Math.random() - 0.5) * 200, duration: 6000 + Math.random() * 4000, easing: "easeInOutSine" },
          { value: baseX + (Math.random() - 0.5) * 200, duration: 6000 + Math.random() * 4000, easing: "easeInOutSine" },
        ],
        translateY: [
          { value: baseY + (Math.random() - 0.5) * 200, duration: 7000 + Math.random() * 4000, easing: "easeInOutSine" },
          { value: baseY + (Math.random() - 0.5) * 200, duration: 7000 + Math.random() * 4000, easing: "easeInOutSine" },
        ],
        scale: [
          { value: r * (0.8 + Math.random() * 0.4), duration: 5000, easing: "easeInOutSine" },
          { value: r * (0.8 + Math.random() * 0.4), duration: 5000, easing: "easeInOutSine" },
        ],
        loop: true,
        direction: "alternate",
      });
    }
    blobs.forEach((b, i) => {
      const positions = [
        { x: -10, y: -10, r: 1 },
        { x: 70, y: 20, r: 1.1 },
        { x: 30, y: 60, r: 1.2 },
        { x: 80, y: 70, r: 0.9 },
      ];
      const cfg = positions[i] || positions[0];
      animateBlob(b, cfg.x, cfg.y, cfg.r);
    });

    // Twinkle particles with anime too
    anime({
      targets: particles,
      opacity: () => anime.random(10, 80) / 100,
      scale: () => anime.random(5, 15) / 10,
      duration: () => anime.random(2000, 4000),
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
      delay: anime.stagger(200),
    });

    return () => {
      anime.remove(blobs);
      anime.remove(particles);
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className="aurora-root" aria-hidden="true">
      {/* Dark base gradient */}
      <div className="aurora-base" />

      {/* Blobs layer */}
      <div className="aurora-blobs">
        <div
          ref={(el) => (blobsRef.current[0] = el)}
          className="aurora-blob aurora-blob--violet"
        />
        <div
          ref={(el) => (blobsRef.current[1] = el)}
          className="aurora-blob aurora-blob--blue"
        />
        <div
          ref={(el) => (blobsRef.current[2] = el)}
          className="aurora-blob aurora-blob--green"
        />
        <div
          ref={(el) => (blobsRef.current[3] = el)}
          className="aurora-blob aurora-blob--pink"
        />
      </div>

      {/* Goo + blur */}
      <div className="aurora-blobs-goo" />
      <div className="aurora-noise" />

      {/* Dot grid overlay */}
      <div className="aurora-grid" />

      {/* Beams (vertical light streaks) */}
      <div className="aurora-beams">
        <div className="aurora-beam" style={{ left: "10%", animationDelay: "0s" }} />
        <div className="aurora-beam" style={{ left: "30%", animationDelay: "2s" }} />
        <div className="aurora-beam" style={{ left: "55%", animationDelay: "4s" }} />
        <div className="aurora-beam" style={{ left: "78%", animationDelay: "1s" }} />
        <div className="aurora-beam" style={{ left: "92%", animationDelay: "3s" }} />
      </div>

      {/* Particles */}
      <div ref={particlesRef} className="aurora-particles" />

      {/* Vignette */}
      <div className="aurora-vignette" />
    </div>
  );
}
