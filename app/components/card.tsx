"use client";

import { motion, useMotionTemplate, useSpring } from "framer-motion";
import type { MouseEvent, PropsWithChildren } from "react";

export const Card: React.FC<PropsWithChildren> = ({ children }) => {
  const mouseX = useSpring(0, { stiffness: 500, damping: 100, restDelta: 0.001 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100, restDelta: 0.001 });

  function onMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(260px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      onMouseMove={onMouseMove}
      className="glitch-panel group relative overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/65 transition duration-300 hover:border-zinc-500/70 hover:bg-zinc-900/55"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-white/[0.07] opacity-0 transition duration-500 group-hover:opacity-100"
        style={style}
      />
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-inner shadow-white/[0.03]" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
