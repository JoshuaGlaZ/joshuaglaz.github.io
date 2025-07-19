"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (pathname === "/") {
      setFade(true);
    } else {
      setFade(false);
      const timeout = setTimeout(() => setFade(true), 10);
      return () => clearTimeout(timeout);
    }
    prevPath.current = pathname;
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={
        pathname === "/"
          ? "opacity-100"
          : `transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`
      }
      style={{ minHeight: "100vh" }}
    >
      {children}
    </div>
  );
} 