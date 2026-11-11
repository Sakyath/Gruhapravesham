import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";
import { approvedBlessingsQuery, DEFAULT_SETTINGS, galleryQuery, settingsQuery } from "@/lib/data";
import { Diya, Mandala, Petals } from "@/components/ornaments";
import { BlessingCard } from "@/components/BlessingCard";
import { MusicToggle } from "@/components/SiteShell";
import { EVENT } from "@/lib/event";
import entrance from "@/assets/home-entrance.jpg";

export const Route = createFileRoute("/display")({
  head: () => ({
    meta: [
      { title: "Live Celebration Display | Gruhapravesam 2026" },
      { name: "description", content: "Full-screen celebration display for the Gruhapravesam ceremony." },
      { property: "og:title", content: "Live Celebration Display | Gruhapravesam 2026" },
      { property: "og:description", content: "Full-screen celebration display for the Gruhapravesam ceremony." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Display,
});

function useRotate(len: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (len < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % len), ms);
    return () => clearInterval(id);
  }, [len, ms]);
  return len ? i % len : 0;
}

function Display() {
  const { data: s = DEFAULT_SETTINGS } = useQuery(settingsQuery);
  const { data: photos = [] } = useQuery(galleryQuery);
  const { data: wishes = [] } = useQuery({ ...approvedBlessingsQuery, refetchInterval: 30_000 });
  const pi = useRotate(photos.length, 7000);
  const wi = useRotate(wishes.length, 9000);
  const [fs, setFs] = useState(false);
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const f = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    let t = setTimeout(() => setIdle(true), 3000);
    const move = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), 3000); };
    window.addEventListener("mousemove", move);
    return () => { document.removeEventListener("fullscreenchange", f); window.removeEventListener("mousemove", move); clearTimeout(t); };
  }, []);
  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  const photo = photos[pi];
  const wish = wishes[wi];

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden ${idle ? "cursor-none" : ""}`}>
      <Petals count={24} />
      <div className="relative z-10 grid h-full w-full grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Mandala className="absolute left-1/4 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 animate-slow-spin text-gold/10" />
          <div className="relative flex items-end gap-6"><Diya size={60} /><Diya size={80} /><Diya size={60} /></div>
          <motion.h1 animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 4, repeat: Infinity }} className="relative font-te mt-4 text-6xl leading-[1.5] text-gold-gradient xl:text-8xl">
            {EVENT.teluguTitle}
          </motion.h1>
          {s.host_names && <p className="relative mt-2 text-3xl italic text-gold-soft xl:text-4xl">{s.host_names}</p>}
          <p className="relative mt-4 font-display text-xl uppercase tracking-[0.35em] text-gold">{EVENT.dateLabel}</p>
          <p className="relative mt-6 max-w-xl text-2xl italic text-ivory/90 xl:text-3xl">{s.display_message}</p>
        </div>
        <div className="flex flex-col justify-center gap-6">
          <div className="royal-card relative aspect-[4/3] w-full overflow-hidden">
            <AnimatePresence mode="sync">
              <motion.img key={photo?.id ?? "default"} src={photo?.url ?? entrance} alt={photo?.caption ?? "Our home"}
                initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
                className="absolute inset-0 h-full w-full object-cover" />
            </AnimatePresence>
            {photo?.caption && <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-deep p-4 text-xl italic text-gold-soft">{photo.caption}</p>}
          </div>
          <div className="min-h-48">
            <AnimatePresence mode="wait">
              {wish && (
                <motion.div key={wish.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }}>
                  <BlessingCard b={wish} large />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className={`absolute right-4 top-4 z-20 flex gap-2 transition-opacity ${idle ? "opacity-0" : "opacity-100"}`}>
        <MusicToggle />
        <button onClick={toggleFs} aria-label="Toggle full screen" className="flex h-10 w-10 items-center justify-center glass-pill rounded-full text-gold">
          {fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
