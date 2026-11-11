import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Diya({ className = "", size = 64 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <radialGradient id="flame" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="45%" stopColor="#ffc940" />
          <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8a5a1c" />
          <stop offset=".5" stopColor="#f2cf7a" />
          <stop offset="1" stopColor="#8a5a1c" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="26" r="22" fill="url(#flame)" opacity=".35" />
      <g className="animate-flicker" style={{ transformBox: "fill-box" }}>
        <path d="M32 10 C38 20 38 28 32 34 C26 28 26 20 32 10Z" fill="url(#flame)" />
      </g>
      <path d="M10 38 Q32 58 54 38 Q48 34 32 36 Q16 34 10 38Z" fill="url(#brass)" />
      <path d="M50 38 L58 33 L54 40Z" fill="url(#brass)" />
      <ellipse cx="32" cy="56" rx="10" ry="3" fill="url(#brass)" />
    </svg>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold sm:w-24" />
      <svg width="34" height="18" viewBox="0 0 34 18">
        <path d="M17 1 L21 9 L17 17 L13 9Z" fill="currentColor" />
        <circle cx="5" cy="9" r="2" fill="currentColor" />
        <circle cx="29" cy="9" r="2" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold sm:w-24" />
    </div>
  );
}

export function MandalaCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`pointer-events-none absolute h-16 w-16 text-gold sm:h-24 sm:w-24 ${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".85">
        <path d="M2 2 H60 M2 2 V60" strokeWidth="2" />
        <path d="M8 8 H45 M8 8 V45" />
        <circle cx="20" cy="20" r="10" />
        <circle cx="20" cy="20" r="4" fill="currentColor" />
        {[0, 45, 90].map((r) => (
          <path key={r} d="M20 20 Q32 14 40 20 Q32 26 20 20Z" transform={`rotate(${r} 20 20)`} />
        ))}
      </g>
    </svg>
  );
}

export function Mandala({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth=".6">
        {[90, 75, 60, 42, 25].map((r) => <circle key={r} cx="100" cy="100" r={r} />)}
        {Array.from({ length: 24 }).map((_, i) => (
          <path key={i} d="M100 10 Q112 40 100 58 Q88 40 100 10Z" transform={`rotate(${i * 15} 100 100)`} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={"b" + i} d="M100 40 Q110 62 100 75 Q90 62 100 40Z" transform={`rotate(${i * 30 + 15} 100 100)`} />
        ))}
      </g>
    </svg>
  );
}

/** Marigold + mango leaf toran */
export function Toran({ className = "" }: { className?: string }) {
  const n = 15;
  return (
    <div className={`pointer-events-none relative w-full ${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 90" preserveAspectRatio="none" className="h-16 w-full sm:h-24">
        <path d="M0 8 Q300 48 600 8" stroke="#7a4a12" strokeWidth="2" fill="none" />
        {Array.from({ length: n }).map((_, i) => {
          const x = (i + 0.5) * (600 / n);
          const y = 8 + 40 * (1 - Math.pow((x - 300) / 300, 2)) * 0.98;
          return (
            <g key={i}>
              <path d={`M${x} ${y} q-9 22 0 40 q9 -18 0 -40Z`} fill={i % 2 ? "#3f7d2c" : "#5a9a37"} />
              <circle cx={x} cy={y} r="9" fill={i % 3 === 0 ? "#f59e0b" : "#f97316"} />
              <circle cx={x} cy={y} r="4" fill="#fcd34d" opacity=".7" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Floating marigold petals & golden sparks. Client-only for stable SSR. */
export function Petals({ count = 18 }: { count?: number }) {
  const [items, setItems] = useState<{ l: number; d: number; dl: number; s: number; dr: number; gold: boolean }[]>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setItems(
      Array.from({ length: count }).map((_, i) => ({
        l: Math.random() * 100,
        d: 9 + Math.random() * 10,
        dl: -Math.random() * 18,
        s: 8 + Math.random() * 10,
        dr: (Math.random() - 0.5) * 160,
        gold: i % 3 === 0,
      })),
    );
  }, [count]);
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className={p.gold ? "absolute top-0 rounded-full bg-gold-soft shadow-glow" : "absolute top-0 rounded-[60%_0_60%_0] bg-saffron/80"}
          style={{
            left: `${p.l}%`,
            width: p.gold ? 4 : p.s,
            height: p.gold ? 4 : p.s * 0.7,
            animation: `fall ${p.d}s linear ${p.dl}s infinite`,
            ["--drift" as string]: `${p.dr}px`,
          }}
        />
      ))}
    </div>
  );
}

const titleItem = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const }, transitionEnd: { filter: "none" } },
};

export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      className="mx-auto mb-10 max-w-2xl text-center"
      initial="hidden"
      animate="shown"
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
    >
      {eyebrow && (
        <motion.p variants={titleItem} className="glass-pill mb-4 inline-block rounded-full px-4 py-1.5 font-display text-xs uppercase tracking-[0.35em] text-gold">
          {eyebrow}
        </motion.p>
      )}
      <motion.h1 variants={titleItem} className="text-gold-shimmer text-3xl font-semibold sm:text-5xl">{title}</motion.h1>
      <motion.div variants={titleItem}><Divider className="my-5" /></motion.div>
      {subtitle && <motion.p variants={titleItem} className="text-lg italic text-muted-foreground sm:text-xl">{subtitle}</motion.p>}
    </motion.div>
  );
}
