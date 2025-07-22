"use client";
import { ArrowLeft, Menu, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export const Navigation: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIntersecting] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10px 0px'
      }
    );

    const currentRef = ref.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname!.startsWith(href)) return true;
    return false;
  };

  const navigationItems = [
    { name: "Projects", href: "/projects" },
    { name: "GSOC", href: "/gsoc" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header ref={ref}>
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isIntersecting
            ? "rgba(24, 24, 27, 0)"
            : "rgba(24, 24, 27, 0.8)",
          borderColor: isIntersecting
            ? "rgba(39, 39, 42, 0)"
            : "rgba(39, 39, 42, 1)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 backdrop-blur-md border-b"
      >
        <div className="container flex items-center justify-between p-4 mx-auto md:p-6">
          {/* Logo/Home Button */}
          <Link
            href="/"
            className="duration-200 text-zinc-300 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded-lg p-1"
            aria-label="Go to homepage"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navigationItems.map(({ name, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      relative duration-200 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500 
                      focus:ring-offset-2 focus:ring-offset-zinc-900
                      ${isActive(href)
                        ? "text-zinc-100 bg-zinc-800/50"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
                      }
                    `}
                  >
                    {name}
                    {isActive(href) && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-zinc-700/30 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden duration-200 text-zinc-300 hover:text-zinc-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md"
            >
              <ul className="p-4 space-y-2">
                {navigationItems.map(({ name, href }, index) => (
                  <motion.li
                    key={href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                  >
                    <Link
                      href={href}
                      className={`
                        block px-4 py-3 rounded-lg text-sm font-medium transition-all
                        focus:outline-none focus:ring-2 focus:ring-zinc-500 
                        focus:ring-offset-2 focus:ring-offset-zinc-900
                        ${isActive(href)
                          ? "text-zinc-100 bg-zinc-800/70"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                        }
                      `}
                    >
                      {name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
};