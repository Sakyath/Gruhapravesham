import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Music, VolumeX, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Petals } from "./ornaments";
import { settingsQuery } from "@/lib/data";
import { isMuted, setMuted, startMusic, stopMusic } from "@/lib/sound";
import { EVENT } from "@/lib/event";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/invitation", label: "Invitation" },
  { to: "/our-home", label: "Our Home" },
  { to: "/location", label: "Location" },
  { to: "/blessings", label: "Blessings" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function MusicToggle() {
  const { data } = useQuery(settingsQuery);
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(sessionStorage.getItem("gp-music") === "1" && !isMuted());
    const turnOn = () => setOn(true);
    window.addEventListener("gp-music-on", turnOn);
    return () => window.removeEventListener("gp-music-on", turnOn);
  }, []);
  useEffect(() => {
    if (on) startMusic(data?.music_url || undefined);
    else stopMusic();
  }, [on, data?.music_url]);
  useEffect(() => () => stopMusic(), []);
  const toggle = () => {
    const next = !on;
    setOn(next);
    sessionStorage.setItem("gp-music", next ? "1" : "0");
    setMuted(!next);
  };
  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn music and sounds off" : "Turn music and sounds on"}
      className="glass-pill relative flex h-10 w-10 items-center justify-center rounded-full text-gold"
    >
      {on && <span className="absolute inset-0 rounded-full border border-gold/60 animate-ping" style={{ animationDuration: "2.4s" }} />}
      {on ? <Music className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-screen">
      <Petals count={14} />
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <nav className="glass-bar mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pl-5 pr-2">
          <Link to="/" className="font-te text-xl text-gold-gradient">
            {EVENT.teluguTitle}
          </Link>
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className="relative block rounded-full px-3 py-1.5 font-display text-xs uppercase tracking-[0.18em] text-ivory/80 transition-colors hover:text-gold"
                  activeOptions={{ exact: true }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="glass-pill absolute inset-0 -z-10 rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={isActive ? "text-gold" : ""}>{n.label}</span>
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <MusicToggle />
            <button
              className="glass-pill flex h-10 w-10 items-center justify-center rounded-full text-gold lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.97, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-bar mx-auto mt-2 max-w-6xl origin-top overflow-hidden rounded-3xl p-2 lg:hidden"
            >
              {NAV.map((n, i) => (
                <motion.li key={n.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl py-3 text-center font-display text-sm uppercase tracking-[0.2em] text-ivory/90 transition-colors hover:bg-gold/10"
                    activeProps={{ className: "text-gold bg-gold/10" }}
                    activeOptions={{ exact: true }}
                  >
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </header>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        {children}
      </motion.main>
      <footer className="relative z-10 px-3 pb-6 pt-10 sm:px-4">
        <div className="royal-card mx-auto max-w-6xl py-10 text-center">
          <p className="font-te text-2xl text-gold-gradient">{EVENT.teluguTitle}</p>
          <p className="mt-2 italic text-muted-foreground">{EVENT.tagline}</p>
          <p className="mt-1 font-display text-xs uppercase tracking-[0.3em] text-gold/70">{EVENT.dateShort}</p>
        </div>
      </footer>
    </div>
  );
}
