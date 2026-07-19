import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import "./StackCardGallery.css";

function CardRotate({ children, onSendToBack, sensitivity = 180, disableDrag }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function handleDragEnd(_, info) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }
  if (disableDrag) {
    return (
      <motion.div className="stack-card-disabled" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className="stack-card-handle"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing", scale: 1.05 }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function StackCardGallery({
  cards = [],
  randomRotation = true,
  sensitivity = 180,
  sendToBackOnClick = true,
  autoplay = true,
  autoplayDelay = 2500,
  pauseOnHover = true,
  mobileClickOnly = true,
  mobileBreakpoint = 768,
  title = "📸 Gallery",
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stack, setStack] = useState(() =>
    cards.map((content, index) => ({ id: index + 1, ...content }))
  );
  const containerRef = useRef(null);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < mobileBreakpoint); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [mobileBreakpoint]);

  useEffect(() => {
    setStack(cards.map((c, i) => ({ id: i + 1, ...c })));
  }, [cards]);

  const sendToBack = (id) => {
    setStack((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const [card] = next.splice(idx, 1);
      next.unshift(card);
      return next;
    });
  };

  useEffect(() => {
    if (!autoplay || stack.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      const top = stack[stack.length - 1];
      if (top) sendToBack(top.id);
    }, autoplayDelay);
    return () => clearInterval(id);
  }, [autoplay, autoplayDelay, stack, isPaused]);

  return (
    <section
      ref={containerRef}
      className="gallery-section"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <h2 className="gallery-title">{title}</h2>
      <p className="gallery-sub">Kéo thả hoặc chạm để xem ảnh tiếp theo ✨</p>
      <div className="gallery-wrap">
        <div className="stack-container">
          {stack.map((card, index) => {
            const rot = randomRotation ? ((index * 37) % 11) - 5 : 0;
            const scale = 1 - (stack.length - 1 - index) * 0.06;
            const zIndex = index + 1;
            return (
              <CardRotate
                key={card.id}
                onSendToBack={() => sendToBack(card.id)}
                sensitivity={sensitivity}
                disableDrag={mobileClickOnly && isMobile}
              >
                <motion.div
                  className="stack-card"
                  onClick={() => (sendToBackOnClick || (mobileClickOnly && isMobile)) && sendToBack(card.id)}
                  style={{
                    rotateZ: rot,
                    scale,
                    zIndex,
                    transformOrigin: "90% 90%",
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <img src={card.src} alt={card.alt || `card-${index}`} className="stack-card-img" draggable={false} />
                  {card.caption && <div className="stack-card-cap">{card.caption}</div>}
                </motion.div>
              </CardRotate>
            );
          })}
        </div>
      </div>
    </section>
  );
}
