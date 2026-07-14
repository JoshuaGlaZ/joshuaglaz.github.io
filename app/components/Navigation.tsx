"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { name: "About", href: "/#about", id: "about" },
  { name: "Experience", href: "/#experience", id: "experience" },
  { name: "Projects", href: "/#projects", id: "projects" },
  { name: "Writing", href: "/#blog", id: "blog" }
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolledSection, setScrolledSection] = useState("");
  const routeSection = pathname === "/projects" || pathname.startsWith("/projects/")
    ? "projects"
    : pathname === "/blog" || pathname.startsWith("/blog/")
      ? "blog"
      : "";
  const activeSection = pathname === "/" ? scrolledSection : routeSection;

  useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
      const spyLineY = window.innerHeight * 0.38;
      const sections = ["about", "experience", "projects", "blog"];
      const hero = document.getElementById("hero");

      if (hero && hero.getBoundingClientRect().bottom > spyLineY) {
        setScrolledSection("");
        return;
      }

      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= spyLineY) current = id;
      }
      setScrolledSection(current);
    };

    const frame = window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex animate-fade-in justify-center px-4 sm:top-6">
      <nav
        aria-label="Primary"
        className="glitch-nav flex w-auto max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border border-zinc-800 bg-black/70 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.42)] backdrop-blur-xl overflow-hidden"
      >
        <Link
          href="/#top"
          aria-label="Home"
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-950 text-zinc-100 transition hover:border-zinc-400 sm:h-9 sm:w-9"
        >
          <Image
            src="/blackhole.png"
            alt=""
            width={30}
            height={30}
            className="rounded-full object-contain"
            style={{ width: 30, height: 30 }}
          />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <li key={link.name} className="relative">
                <Link
                  href={link.href}
                  className={`relative z-10 block rounded-full px-4 py-2 text-xs font-medium uppercase tracking-normal transition-colors duration-200 ${
                    isActive ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-zinc-800/85 ring-1 ring-zinc-700/70"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/#contact"
          className="glitch-button shrink-0 rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-normal text-zinc-950 transition hover:bg-white md:ml-1"
        >
          Contact
        </Link>
      </nav>
    </header>
  );
}
