import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import doorPanel from "@/assets/door-panel.jpg";
import { Button } from "@/components/ui/button";
import { Diya, Toran } from "./ornaments";
import { playBell, playChimes, playWhoosh, requestMusicOn } from "@/lib/sound";
import { EVENT } from "@/lib/event";

const EASE = [0.65, 0, 0.25, 1] as const;

function Door({ side, open }: { side: "left" | "right"; open: boolean }) {
  const left = side === "left";
  return (
    <motion.div
      className="relative h-full w-1/2"
      style={{ transformOrigin: left ? "left center" : "right center", transformStyle: "preserve-3d" }}
      animate={open ? { rotateY: left ? -112 : 112 } : { rotateY: 0 }}
      transition={{ duration: 2.4, ease: EASE, delay: 0.35 }}
    >
      <div
        className="absolute inset-0 overflow-hidden border-[6px] border-wood shadow-royal"
        style={{
          backgroundImage: `linear-gradient(${left ? "90deg" : "270deg"}, rgba(0,0,0,.35), transparent 30%, transparent 85%, rgba(0,0,0,.5)), url(${doorPanel})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backfaceVisibility: "hidden",
        }}
      >
        {/* polished-wood light sweep */}
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-gold-soft/25 to-transparent"
          initial={{ x: "-120%" }}
          animate={{ x: "320%" }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut", delay: left ? 0.8 : 1.1 }}
          style={{ skewX: -18 }}
        />
      </div>
      {/* brass handle */}
      <div className={`absolute top-1/2 ${left ? "right-3 sm:right-5" : "left-3 sm:left-5"} -translate-y-1/2`}>
        <div className="h-16 w-4 rounded-full bg-gold-gradient shadow-glow sm:h-24 sm:w-5" />
        <div className="mx-auto -mt-1 h-6 w-6 rounded-full border-4 border-gold bg-transparent sm:h-8 sm:w-8" />
      </div>
    </motion.div>
  );
}

type Spark = { a: number; d: number; s: number; dl: number };
type Ember = { l: number; s: number; d: number; dl: number };

export function Entrance({ onEnter }: { onEnter: () => void }) {
  const [open, setOpen] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    setEmbers(Array.from({ length: 26 }, () => ({ l: Math.random() * 100, s: 2 + Math.random() * 4, d: 7 + Math.random() * 8, dl: -Math.random() * 12 })));
  }, []);

  const enter = () => {
    if (open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    playBell();
    setTimeout(playWhoosh, 380);
    setTimeout(() => playChimes(11), 1100);
    setTimeout(requestMusicOn, 2600);
    setSparks(Array.from({ length: 56 }, () => ({ a: Math.random() * Math.PI * 2, d: 180 + Math.random() * 520, s: 3 + Math.random() * 6, dl: 0.4 + Math.random() * 0.5 })));
    setOpen(true);
    setTimeout(onEnter, reduced ? 300 : 3300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-maroon-deep/60 backdrop-blur-2xl" role="dialog" aria-label="Entrance">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-maroon-deep via-maroon-deep/85 to-transparent" />
      {/* rotating god-rays */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[45%] h-[220vmax] w-[220vmax] animate-rays"
        style={{
          background: "repeating-conic-gradient(from 0deg, oklch(0.9 0.12 85 / 0.22) 0deg 4deg, transparent 4deg 15deg)",
          maskImage: "radial-gradient(circle, black 0%, transparent 32%)",
          translate: "-50% -50%",
        }}
        animate={open ? { opacity: 1, scale: 1.5 } : { opacity: 0.45, scale: 1 }}
        transition={{ duration: 2.4, ease: EASE }}
      />
      {/* warm light inside the home */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,oklch(0.95_0.09_88),oklch(0.75_0.14_70/0.8)_22%,transparent_62%)]"
        animate={open ? { opacity: 1, scale: 1.3 } : { opacity: [0.65, 0.85, 0.65] }}
        transition={open ? { duration: 2, ease: EASE } : { duration: 5, repeat: Infinity }}
      />
      {/* rising embers */}
      {embers.map((e, i) => (
        <span
          key={i}
          className="pointer-events-none absolute bottom-0 rounded-full bg-gold-soft shadow-glow"
          style={{ left: `${e.l}%`, width: e.s, height: e.s, animation: `rise ${e.d}s linear ${e.dl}s infinite` }}
        />
      ))}

      <motion.div
        className="absolute inset-0 flex flex-col items-center"
        animate={open ? { scale: 2.1, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, delay: 1.1, ease: [0.5, 0, 0.3, 1] }}
        style={{ perspective: 1600 }}
      >
        <motion.div
          className="relative z-20 w-full max-w-4xl origin-top px-2 pt-2"
          animate={{ rotate: [-0.6, 0.6, -0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Toran />
        </motion.div>
        <div className="relative -mt-6 flex h-[72vh] w-[92vw] max-w-3xl border-[10px] border-wood shadow-royal sm:-mt-10" style={{ transformStyle: "preserve-3d" }}>
          <div className="pointer-events-none absolute -inset-[14px] border-2 border-gold/60 shadow-glow" />
          {/* light leaking through the seam, bursting open */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,oklch(0.98_0.06_90),oklch(0.85_0.13_80/0.6)_35%,transparent_70%)] blur-md"
            initial={{ scaleX: 0.15, opacity: 0.7 }}
            animate={open ? { scaleX: 14, opacity: 1 } : { scaleX: [0.12, 0.22, 0.12], opacity: [0.55, 0.9, 0.55] }}
            transition={open ? { duration: 2, delay: 0.35, ease: EASE } : { duration: 3, repeat: Infinity }}
          />
          <Door side="left" open={open} />
          <Door side="right" open={open} />
        </div>
        <div className="relative z-20 -mt-10 flex w-[100vw] max-w-4xl items-end justify-between px-2 sm:px-0">
          <Diya size={56} />
          <svg viewBox="0 0 300 40" className="h-10 w-2/3 sm:h-14" aria-hidden="true">
            <g fill="none" strokeWidth="1.5">
              <ellipse cx="150" cy="22" rx="140" ry="16" stroke="#f5d48a" />
              <ellipse cx="150" cy="22" rx="100" ry="11" stroke="#f97316" />
              <ellipse cx="150" cy="22" rx="60" ry="7" stroke="#fde68a" />
              {Array.from({ length: 16 }).map((_, i) => (
                <circle key={i} cx={150 + 120 * Math.cos((i / 16) * Math.PI * 2)} cy={22 + 13 * Math.sin((i / 16) * Math.PI * 2)} r="2.4" fill="#fbbf24" />
              ))}
            </g>
          </svg>
          <Diya size={56} />
        </div>
      </motion.div>

      {/* glass welcome card over the doors */}
      <AnimatePresence>
        {!open && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center px-4"
            exit={{ opacity: 0, scale: 1.08, filter: "blur(16px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="royal-card w-full max-w-md px-6 py-9 text-center sm:px-10"
            >
              <motion.div className="relative flex justify-center" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}>
                <span className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orb-gold blur-xl animate-halo" />
                <Diya size={72} className="relative" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16, filter: "blur(12px)", letterSpacing: "0.2em" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "0.02em" }}
                transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-te mt-2 text-4xl leading-relaxed text-gold-shimmer sm:text-5xl"
              >
                {EVENT.teluguTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 1 }}
                className="mt-2 text-xl italic text-ivory sm:text-2xl"
              >
                A New Beginning Awaits You
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
                <Button variant="royal" size="lg" className="mt-7 h-12 px-8" onClick={enter} autoFocus data-silent>
                  Enter Our Home
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* golden spark burst from the doorway */}
      {open && (
        <div className="pointer-events-none absolute left-1/2 top-[45%] z-40">
          {sparks.map((s, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-gold-soft shadow-glow"
              style={{ width: s.s, height: s.s }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{ x: Math.cos(s.a) * s.d, y: Math.sin(s.a) * s.d + 60, opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6] }}
              transition={{ duration: 1.8, delay: s.dl, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>
      )}
      {/* bloom flash as we step inside */}
      {open && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_50%_45%,oklch(0.98_0.05_90),oklch(0.85_0.12_80/0.5)_40%,transparent_75%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.85, 0] }}
          transition={{ duration: 3.2, times: [0, 0.45, 0.75, 1] }}
        />
      )}

      <button
        onClick={onEnter}
        className="glass-pill absolute bottom-4 right-4 z-50 rounded-full px-4 py-2 font-display text-xs uppercase tracking-[0.2em] text-gold-soft"
      >
        Skip intro
      </button>
    </div>
  );
}
