import React, { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";

/**
 * reactbits DecryptedText: animates scramble of characters, revealing the real text.
 * Props:
 *  - text: target text
 *  - speed: ms per iteration (default 50)
 *  - maxIterations: how many scramblings per char before locking (default 12)
 *  - characters: scramble character set
 *  - animateOn: "hover" | "view" (default "hover")
 *  - sequential: reveal from left to right (default true)
 *  - revealDirection: "start" | "end" | "center"
 *  - triggerOnClick: boolean (if true triggers once on click)
 *  - className, encryptedClassName, parentClassName
 */
export default function DecryptedText({
  text = "",
  speed = 40,
  maxIterations = 15,
  characters = CHARS,
  animateOn = "view",
  sequential = true,
  revealDirection = "start",
  triggerOnClick = false,
  className = "",
  encryptedClassName = "",
  parentClassName = "",
  ...rest
}) {
  const [display, setDisplay] = useState(() => scrambleAll(text, characters));
  const [isRunning, setIsRunning] = useState(false);
  const hasRunRef = useRef(false);
  const ref = useRef(null);
  const intervalRef = useRef(null);

  function scrambleAll(str, chars) {
    return str.split("").map(c => (c === " " ? " " : chars[Math.floor(Math.random() * chars.length)])).join("");
  }

  function decrypt() {
    if (isRunning) return;
    setIsRunning(true);
    let iter = 0;
    const len = text.length;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      iter++;
      const revealCount = sequential
        ? Math.floor((iter / maxIterations) * len)
        : iter >= maxIterations ? len : 0;

      let revealStart = 0, revealEnd = 0;
      if (sequential) {
        if (revealDirection === "end") {
          revealStart = len - revealCount;
          revealEnd = len;
        } else if (revealDirection === "center") {
          const half = Math.floor(revealCount / 2);
          const mid = Math.floor(len / 2);
          revealStart = Math.max(0, mid - half);
          revealEnd = Math.min(len, mid + half + (revealCount % 2));
        } else {
          revealStart = 0;
          revealEnd = revealCount;
        }
      } else {
        revealStart = iter >= maxIterations ? 0 : len;
        revealEnd = iter >= maxIterations ? len : 0;
      }

      let out = "";
      for (let i = 0; i < len; i++) {
        if (text[i] === " ") { out += " "; continue; }
        if (sequential && i >= revealStart && i < revealEnd) {
          out += text[i];
        } else if (!sequential && iter >= maxIterations) {
          out += text[i];
        } else {
          out += characters[Math.floor(Math.random() * characters.length)];
        }
      }
      setDisplay(out);

      if (iter >= maxIterations) {
        clearInterval(intervalRef.current);
        setDisplay(text);
        setIsRunning(false);
        hasRunRef.current = true;
      }
    }, speed);
  }

  // animate on view using IntersectionObserver
  useEffect(() => {
    if (animateOn !== "view") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !hasRunRef.current) {
            decrypt();
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line
  }, [text, animateOn]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const eventProps = {};
  if (animateOn === "hover") {
    eventProps.onMouseEnter = decrypt;
  }
  if (triggerOnClick) {
    eventProps.onClick = decrypt;
  }

  return (
    <span
      ref={ref}
      className={`decrypted-parent ${parentClassName}`}
      {...eventProps}
      {...rest}
    >
      <span className={`decrypted-text ${className} ${display !== text ? encryptedClassName : ""}`}>
        {display}
      </span>
    </span>
  );
}
