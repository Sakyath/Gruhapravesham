import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SectionTitle } from "@/components/ornaments";
import { Lightbox, PhotoPlaceholder } from "@/components/Lightbox";
import { galleryQuery } from "@/lib/data";
import { GALLERY_CATEGORIES } from "@/lib/event";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery")({
  head: () => pageHead("Gallery", "Memories That Make a Home – photographs from our new home and celebration."),
  component: Gallery,
});

function Gallery() {
  const { data = [], isLoading, isError } = useQuery(galleryQuery);
  const [cat, setCat] = useState<string>("All");
  const [lb, setLb] = useState<number | null>(null);
  const imgs = cat === "All" ? data : data.filter((d) => d.category === cat);
  const showHomeMedia = cat === "All" || cat === GALLERY_CATEGORIES[0];
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="Gallery" title="Memories That Make a Home" />
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {["All", ...GALLERY_CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`glass-pill rounded-full px-4 py-2 font-display text-xs uppercase tracking-[0.15em] ${cat === c ? "text-gold ring-1 ring-gold/70" : "text-ivory/80"}`}>
              {c}
            </button>
          ))}
        </div>
        {showHomeMedia && (
          <section aria-labelledby="home-media-title" className="mb-12">
            <h2 id="home-media-title" className="mb-5 text-center font-display text-2xl uppercase tracking-[0.15em] text-gold">
              Our New Home
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <figure className="royal-card overflow-hidden">
                <img
                  src="/gallery/isha-signature.jpeg"
                  alt="Isha Signature apartment building at dusk"
                  width={768}
                  height={768}
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="glass-bar p-4 text-center italic text-gold-soft">Our new home</figcaption>
              </figure>
              <figure className="royal-card overflow-hidden">
                <video
                  className="aspect-video w-full bg-black object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/gallery/isha-signature.jpeg"
                  aria-label="Video tour of our new home"
                >
                  <source src="/gallery/isha-signature-tour.mp4" type="video/mp4" />
                  Your browser does not support video playback.
                </video>
                <figcaption className="glass-bar p-4 text-center italic text-gold-soft">A video tour of our new home</figcaption>
              </figure>
            </div>
          </section>
        )}
        {isLoading ? <p className="text-center text-muted-foreground">Loading photographs…</p>
          : isError ? <p className="text-center text-destructive">Couldn't load photos. Please refresh.</p>
          : !imgs.length ? <div className="mx-auto max-w-md"><PhotoPlaceholder label={cat === "All" ? "Our Gallery" : cat} /></div>
          : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {imgs.map((img, i) => (
                <motion.button key={img.id} onClick={() => setLb(i)} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="royal-card group mb-4 block w-full break-inside-avoid overflow-hidden">
                  <img src={img.url} alt={img.caption ?? img.category} loading="lazy" decoding="async" className="w-full transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-maroon-deep to-transparent p-4 text-left italic text-gold-soft transition group-hover:translate-y-0">
                    {img.caption || img.category}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
      </section>
      {lb !== null && <Lightbox images={imgs} index={lb} onIndex={setLb} onClose={() => setLb(null)} />}
    </SiteShell>
  );
}
