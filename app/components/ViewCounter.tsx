"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface ViewCounterProps {
  slug: string;
  initial?: number;
}

export function ViewCounter({ slug, initial = 0 }: ViewCounterProps) {
  const [views, setViews] = useState(initial);

  useEffect(() => {
    let didCancel = false;

    async function bump() {
      try {
        const res = await fetch("/api/incr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (res.ok) {
          setViews(v => v + 1);
        } else {
          throw new Error(`API returned ${res.status}`);
        }
      } catch {
        const key = `views:${slug}`;
        const stored = parseInt(localStorage.getItem(key) ?? "", 10) || initial;
        const next = stored + 1;
        localStorage.setItem(key, next.toString());
        if (!didCancel) setViews(next);
      }
    }

    bump();
    return () => { didCancel = true; };
  }, [slug, initial]);

  return (
    <span className="flex items-center gap-1 text-xs text-zinc-500">
      <Eye className="w-4 h-4" />
      {new Intl.NumberFormat("en-US", { notation: "compact" }).format(views)}
    </span>
  );
}