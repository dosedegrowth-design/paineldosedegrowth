"use client";

/* Headline revelada palavra a palavra: blur + lift, easing expo. */

import { motion, useReducedMotion } from "framer-motion";

export function SplitText({
  text,
  className,
  delay = 0,
  gradient = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  gradient?: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return (
      <span className={`${className ?? ""} ${gradient ? "andre-gradient-text" : ""}`}>
        {text}
      </span>
    );
  }

  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-visible whitespace-pre">
          <motion.span
            className={`inline-block ${gradient ? "andre-gradient-text" : ""}`}
            initial={{ opacity: 0, y: "0.6em", filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
