"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Particles = dynamic(() => import("./components/particles"), { ssr: false });

const navigation = [
  { name: "Projects", href: "/projects" },
  { name: "GSOC", href: "/gsoc  " },
  { name: "Contact", href: "/contact" },
];

const variants = {
  enter: { opacity: 0, scale: 0.98 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
};

const letterContainer = {
  hidden: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      staggerDirection: -1,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      staggerDirection: 1,
    },
  },
};
const letter = {
  hidden: { opacity: 0, y: 8, transition: { duration: 0.3, ease: "easeOut" } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function Home() {
  const phrases = useMemo(
    () => [
      "Joshua Daniel Talahatu",
      "Backend Developer",
      "Lifelong Learner",
      "Coffee Enthusiast",
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [phraseAnimationStarted, setPhraseAnimationStarted] = useState(false);
  const timeoutRef = useRef<number>();

  const currentPhrase = useMemo(() => phrases[index], [phrases, index]);
  const letters = useMemo(() => currentPhrase.split(""), [currentPhrase]);

  useEffect(() => {
    const startTimeout = setTimeout(() => setPhraseAnimationStarted(true), 600);
    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (!phraseAnimationStarted) return;
    const displayDuration = show ? 2000 : 300;
    timeoutRef.current = window.setTimeout(() => {
      setShow((prev) => !prev);
      if (!show) {
        setIndex((i) => (i + 1) % phrases.length);
      }
    }, displayDuration);

    return () => clearTimeout(timeoutRef.current);
  }, [show, phrases.length, phraseAnimationStarted]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <nav className="my-16 opacity-0 animate-fade-in animate-delay-200">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map(({ name, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm transition-colors duration-300 text-zinc-500 hover:text-zinc-300"
            >
              {name}
            </Link>
          ))}
        </ul>
      </nav>

      <div className="hidden w-screen h-px animate-delay-300 animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

      <Particles
        className="absolute inset-0 -z-10 opacity-0 animate-fade-in animate-delay-400"
        quantity={500}
      />

      <h1 className="z-10 text-4xl sm:text-6xl md:text-9xl font-display text-edge-outline bg-clip-text text-transparent bg-white animate-title">
        JoshuaGlaZ
      </h1>

      <div className="hidden w-screen h-px animate-delay-300 animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

      <div className="mt-8 text-center opacity-0 animate-fade-in animate-delay-600">
        <h2 className="text-sm text-zinc-500">
          Hi, I&apos;m{' '}
          <span aria-live="polite" className="inline-block">
            <AnimatePresence mode="wait">
              {phraseAnimationStarted && show && (
                <motion.span
                  key={currentPhrase}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={letterContainer}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="inline-block"
                >
                  {letters.map((char, i) => (
                    <motion.span
                      key={i}
                      variants={letter}
                      className="inline-block"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </h2>
      </div>
    </div>
  );
}
