import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCountdown, type CountdownState } from "@/lib/countdown";
import { EVENT } from "@/lib/event";

function Unit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="royal-card flex w-[4.6rem] flex-col items-center py-4 sm:w-28 sm:py-6">
      <div className="relative h-10 overflow-hidden sm:h-14" style={{ perspective: 400 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={v}
            initial={{ y: -28, opacity: 0, rotateX: 70, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
            exit={{ y: 28, opacity: 0, rotateX: -70, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="block font-display text-3xl text-gold-gradient sm:text-5xl"
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 font-display text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">{label}</span>
    </div>
  );
}

export function Countdown() {
  const [state, setState] = useState<CountdownState | null>(null);
  useEffect(() => {
    const tick = () => setState(getCountdown(Date.now(), EVENT.startUtc, EVENT.endUtc));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (!state) return <div className="h-32" />;
  if (state.phase === "today")
    return <p className="text-center font-display text-2xl text-gold-gradient sm:text-3xl">Today is the day! Welcome to our celebration!</p>;
  if (state.phase === "after")
    return <p className="mx-auto max-w-xl text-center text-xl italic text-gold-soft sm:text-2xl">Our beautiful beginning has started. Thank you for being part of our memories.</p>;
  return (
    <div className="text-center">
      <div className="flex justify-center gap-2 sm:gap-4" role="timer" aria-live="off">
        <Unit value={state.days} label="Days" />
        <Unit value={state.hours} label="Hours" />
        <Unit value={state.minutes} label="Minutes" />
        <Unit value={state.seconds} label="Seconds" />
      </div>
      <p className="mt-6 italic text-muted-foreground">Every moment brings us closer to our new beginning!</p>
    </div>
  );
}
