import React, { useEffect, useRef } from "react";
import anime from "animejs";
import "./PageEffects.css";

/**
 * Page-wide effects:
 * - Stagger entrance animation for cards/links/buttons when they enter viewport
 * - Subtle hover glow pulse
 * - Click ripple
 * - Cursor sparkles trail (optional, subtle star particles following mouse)
 */
export default function PageEffects() {
  const trailRef = useRef(null);

  // Stagger animate cards on scroll (using IntersectionObserver)
  useEffect(() => {
    const selectors = [
      'section[class*="space-y-4"] > div, section[class*="grid"] > div',
    ].join(",");

    function animateCards(cards) {
      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.95, 1],
        delay: anime.stagger(70, { start: 50 }),
        duration: 650,
        easing: "easeOutExpo",
      });
    }

    // Initial entrance for cards already in DOM (after first render)
    setTimeout(() => {
      const initial = Array.from(document.querySelectorAll(selectors)).filter(
        (el) => el.getBoundingClientRect().top < window.innerHeight
      );
      animateCards(initial);
    }, 200);

    // Subsequent ones on scroll
    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target);
        if (inView.length) {
          animateCards(inView);
          inView.forEach((el) => io.unobserve(el));
        }
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(selectors).forEach((el) => {
      if (el.getBoundingClientRect().top >= window.innerHeight) {
        el.style.opacity = "0";
        io.observe(el);
      }
    });

    // Ripple on click for buttons/cards
    function addRipple(e) {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement("span");
      ripple.className = "ripple-dot";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      el.appendChild(ripple);
      anime({
        targets: ripple,
        opacity: [0.35, 0],
        scale: [0, 3],
        duration: 600,
        easing: "easeOutQuad",
        complete: () => ripple.remove(),
      });
    }
    const clickables = document.querySelectorAll("button, a[href], [role='link']");
    clickables.forEach((el) => {
      // ensure position can contain absolute ripple
      const cs = getComputedStyle(el);
      if (cs.position === "static") el.style.position = "relative";
      el.style.overflow = el.style.overflow || "hidden";
      el.addEventListener("click", addRipple);
    });

    // Cursor sparkle trail (throttled)
    const trail = [];
    const TRAIL_COUNT = 8;
    const trailParent = trailRef.current;
    function spawnTrail(x, y) {
      const el = document.createElement("div");
      el.className = "cursor-sparkle";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      const hue = Math.floor(Math.random() * 80) + 160; // cyan/green/purple range
      el.style.color = `hsl(${hue}, 90%, 65%)`;
      el.textContent = Math.random() < 0.5 ? "✦" : "·";
      trailParent.appendChild(el);
      trail.push(el);
      anime({
        targets: el,
        translateY: -30 - Math.random() * 30,
        translateX: (Math.random() - 0.5) * 30,
        opacity: [1, 0],
        scale: [Math.random() * 0.8 + 0.5, 0],
        duration: 700 + Math.random() * 400,
        easing: "easeOutCubic",
        complete: () => el.remove(),
      });
      if (trail.length > TRAIL_COUNT) {
        const old = trail.shift();
        if (old) old.remove();
      }
    }
    let lastSpawn = 0;
    function onMove(e) {
      const now = Date.now();
      if (now - lastSpawn < 80) return;
      lastSpawn = now;
      spawnTrail(e.clientX, e.clientY);
    }
    // Only add trail on desktop (non-touch)
    const isTouch = matchMedia?.("(pointer: coarse)").matches;
    if (!isTouch) {
      window.addEventListener("mousemove", onMove);
    }

    return () => {
      io.disconnect();
      clickables.forEach((el) => el.removeEventListener("click", addRipple));
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <div ref={trailRef} className="cursor-trail-layer" aria-hidden="true" />;
}
