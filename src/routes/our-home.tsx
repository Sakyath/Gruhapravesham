import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SectionTitle } from "@/components/ornaments";
import { Lightbox, PhotoPlaceholder } from "@/components/Lightbox";
import { galleryQuery } from "@/lib/data";
import { pageHead } from "@/lib/seo";
import entrance from "@/assets/home-entrance.jpg";

const ROOMS = [
  { label: "Our Dream Home", category: "Our New Home", text: "The doorway to every tomorrow we've dreamed of together." },
  { label: "Living Room", category: "Living Room", text: "Where conversations, laughter and festivals will gather." },
  { label: "Beautiful Memories", category: "Special Memories", text: "Little moments that turned a house into a home." },
  { label: "Family Moments", category: "Family Moments", text: "The people who make every corner feel warm." },
];

export const Route = createFileRoute("/our-home")({
  head: () => pageHead("Our Home", "A Place We Call Home – a glimpse of our new home and the memories it holds."),
  component: OurHome,
});

function OurHome() {
  const { data = [], isLoading } = useQuery(galleryQuery);
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState<number | null>(null);
  const room = ROOMS[active] ?? ROOMS[0]!;
  const imgs = data.filter((d) => d.category === room.category);
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="Our Home" title="A Place We Call Home" subtitle="Built with love, blessed by family." />
        <motion.img initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
          src={entrance} alt="Our decorated home entrance" width={1536} height={1024} className="royal-card w-full object-cover" style={{ aspectRatio: "3/2" }} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROOMS.map((r, i) => (
            <motion.button key={r.label} onClick={() => setActive(i)} whileHover={{ y: -6, rotateX: 4 }} style={{ transformPerspective: 800 }}
              className={`royal-card p-6 text-left transition ${i === active ? "ring-2 ring-gold" : "opacity-85"}`} aria-pressed={i === active}>
              <p className="font-display text-sm uppercase tracking-[0.2em] text-gold">{r.label}</p>
              <p className="mt-2 italic text-muted-foreground">{r.text}</p>
            </motion.button>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? <p className="text-center text-muted-foreground sm:col-span-3">Loading…</p> : imgs.length ? imgs.map((img, i) => (
            <button key={img.id} onClick={() => setLb(i)} className="royal-card group overflow-hidden">
              <img src={img.url} alt={img.caption ?? room.label} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
              {img.caption && <p className="glass-bar p-3 text-sm italic text-gold-soft">{img.caption}</p>}
            </button>
          )) : <PhotoPlaceholder label={room.label} />}
        </div>
      </section>
      {lb !== null && <Lightbox images={imgs} index={lb} onIndex={setLb} onClose={() => setLb(null)} />}
    </SiteShell>
  );
}
