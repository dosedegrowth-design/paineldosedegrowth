"use client";

/* Feixes de ar frio que caem e explodem em partículas de gelo ao
   tocar o "chão" do container. Adaptado da Aceternity (21st.dev) —
   recolorido em ciano e com posições em % pra responder bem no mobile. */

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type BeamOptions = {
  left: string;
  duration?: number;
  delay?: number;
  repeatDelay?: number;
  className?: string;
};

const BEAMS: BeamOptions[] = [
  { left: "6%", duration: 7, repeatDelay: 3, delay: 2 },
  { left: "16%", duration: 5, repeatDelay: 7, className: "h-6" },
  { left: "28%", duration: 8, repeatDelay: 4, delay: 1 },
  { left: "41%", duration: 4, repeatDelay: 6, delay: 3, className: "h-16" },
  { left: "53%", duration: 6, repeatDelay: 3, delay: 5 },
  { left: "66%", duration: 9, repeatDelay: 2, className: "h-20" },
  { left: "78%", duration: 5, repeatDelay: 5, delay: 2, className: "h-10" },
  { left: "90%", duration: 7, repeatDelay: 4, delay: 4, className: "h-6" },
];

export function BeamsCollision({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  return (
    <div
      ref={parentRef}
      className={cn(
        "andre-fx-beams relative flex w-full items-center justify-center overflow-hidden",
        className
      )}
    >
      {!reduce &&
        BEAMS.map((beam, i) => (
          <CollisionMechanism
            key={`beam-${i}`}
            beamOptions={beam}
            containerRef={containerRef}
            parentRef={parentRef}
          />
        ))}

      {children}

      {/* chão de colisão — linha de luz fria na base */}
      <div
        ref={containerRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(185 100% 50% / 0.35), transparent)",
          boxShadow: "0 -6px 24px hsl(185 100% 50% / 0.12)",
        }}
      />
    </div>
  );
}

function CollisionMechanism({
  parentRef,
  containerRef,
  beamOptions,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  beamOptions: BeamOptions;
}) {
  const beamRef = useRef<HTMLDivElement>(null);
  const [collision, setCollision] = useState<{
    detected: boolean;
    coordinates: { x: number; y: number } | null;
  }>({ detected: false, coordinates: null });
  const [beamKey, setBeamKey] = useState(0);
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !cycleCollisionDetected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        if (beamRect.bottom >= containerRect.top) {
          const relativeX = beamRect.left - parentRect.left + beamRect.width / 2;
          const relativeY = beamRect.bottom - parentRect.top;
          setCollision({
            detected: true,
            coordinates: { x: relativeX, y: relativeY },
          });
          setCycleCollisionDetected(true);
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 50);
    return () => clearInterval(animationInterval);
  }, [cycleCollisionDetected, containerRef, parentRef]);

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollisionDetected(false);
      }, 2000);
      setTimeout(() => setBeamKey((prev) => prev + 1), 2000);
    }
  }, [collision]);

  return (
    <>
      <motion.div
        key={beamKey}
        ref={beamRef}
        animate="animate"
        initial={{ translateY: "-200px" }}
        variants={{ animate: { translateY: "1800px" } }}
        transition={{
          duration: beamOptions.duration || 8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beamOptions.delay || 0,
          repeatDelay: beamOptions.repeatDelay || 0,
        }}
        style={{ left: beamOptions.left }}
        className={cn(
          "absolute top-0 m-auto h-14 w-px rounded-full bg-gradient-to-t from-cyan-400 via-sky-500 to-transparent",
          beamOptions.className
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Explosion(props: React.HTMLProps<HTMLDivElement>) {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }));

  return (
    <div {...props} className={cn("absolute z-40 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm"
      />
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: span.directionX, y: span.directionY, opacity: 0 }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-cyan-300 to-sky-500"
        />
      ))}
    </div>
  );
}
