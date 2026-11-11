import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import type { GalleryImage } from "@/lib/data";

export function Lightbox({ images, index, onClose, onIndex }: { images: GalleryImage[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const img = images[index];
  const prev = () => onIndex((index - 1 + images.length) % images.length);
  const next = () => onIndex((index + 1) % images.length);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  });
  if (!img) return null;
  const btn = "absolute flex h-12 w-12 items-center justify-center glass-pill rounded-full text-gold";
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-maroon-deep/50 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <img src={img.url} alt={img.caption ?? img.category} className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-royal" onClick={(e) => e.stopPropagation()} />
      <p className="mt-4 text-center text-lg italic text-gold-soft">{img.caption || img.category}</p>
      <p className="text-sm text-muted-foreground">{index + 1} / {images.length}</p>
      <button className={`${btn} right-4 top-4`} onClick={onClose} aria-label="Close"><X /></button>
      {images.length > 1 && (
        <>
          <button className={`${btn} left-3 top-1/2`} onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous photo"><ChevronLeft /></button>
          <button className={`${btn} right-3 top-1/2`} onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next photo"><ChevronRight /></button>
        </>
      )}
    </div>
  );
}

export function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="royal-card flex aspect-[4/3] flex-col items-center justify-center p-6 text-center">
      <svg viewBox="0 0 64 64" className="h-12 w-12 text-gold/60" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 30 L32 10 L56 30" /><path d="M14 26 V54 H50 V26" /><path d="M27 54 V40 H37 V54" /></g></svg>
      <p className="mt-3 font-display text-sm uppercase tracking-[0.2em] text-gold/80">{label}</p>
      <p className="mt-1 text-sm italic text-muted-foreground">Photographs coming soon</p>
    </div>
  );
}
