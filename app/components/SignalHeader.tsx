import type { ReactNode } from "react";
import { Activity, Binary, Cpu, Radio } from "lucide-react";
import LEDSwarm from "./LEDSwarm";

interface SignalHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: string[];
  children?: ReactNode;
  className?: string;
  compact?: boolean;
  align?: "left" | "center";
  showSwarm?: boolean;
  minimal?: boolean;
}

const signalIcons = [Activity, Cpu, Binary, Radio];

export function SignalHeader({
  eyebrow,
  title,
  description,
  meta = [],
  children,
  className = "",
  compact = false,
  align = "left",
  showSwarm = false,
  minimal = false
}: SignalHeaderProps) {
  const signals = meta.length > 0 ? meta : ["signal: online", "layout: led", "motion: restrained"];
  const titleSize = compact
    ? "text-3xl sm:text-4xl md:text-5xl"
    : "text-4xl sm:text-6xl md:text-7xl lg:text-8xl";
  const alignClass = align === "center" ? "signal-header-center" : "";

  return (
    <section className={minimal ? `relative border-b border-zinc-900 pb-8 ${alignClass} ${className}` : `signal-header ${compact ? "signal-header-compact" : ""} ${alignClass} ${className}`}>
      {showSwarm && <LEDSwarm className="signal-header-swarm" />}
      {!minimal && <div aria-hidden="true" className="signal-header-overlay" />}
      {!minimal && <div aria-hidden="true" className="signal-header-noise" />}
      <div className="relative z-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-zinc-400">
            {eyebrow}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-normal text-zinc-500">
            {signals.slice(0, 4).map((item, index) => {
              const Icon = signalIcons[index % signalIcons.length];
              return (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-black/60 px-2.5 py-1"
                >
                  <Icon className="h-3 w-3 text-zinc-400" aria-hidden="true" />
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        <h1 className={`signal-header-title max-w-5xl break-words font-display font-bold leading-none tracking-normal text-zinc-100 ${titleSize}`}>
          {title}
        </h1>

        {description && (
          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
            {description}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
