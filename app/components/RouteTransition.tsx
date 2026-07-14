"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const mountedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const startTimer = window.setTimeout(() => setIsNavigating(true), 0);
    const doneTimer = window.setTimeout(() => setIsNavigating(false), 520);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(doneTimer);
    };
  }, [pathname]);

  const variants = reduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 }
      }
    : {
        initial: { opacity: 0, y: 10, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -8, filter: "blur(6px)" }
      };

  return (
    <>
      <div
        className={`route-progress ${isNavigating && !reduceMotion ? "route-progress-active" : ""}`}
        aria-hidden="true"
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
