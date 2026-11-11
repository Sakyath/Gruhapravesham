import type { Blessing } from "@/lib/data";

export function BlessingCard({ b, large = false }: { b: Blessing; large?: boolean }) {
  return (
    <figure className={`royal-card h-full p-6 ${large ? "sm:p-10" : ""}`}>
      <svg viewBox="0 0 40 20" className="mx-auto mb-3 h-5 w-10 text-gold" aria-hidden="true"><path d="M20 2 C24 8 30 10 38 10 C30 10 24 12 20 18 C16 12 10 10 2 10 C10 10 16 8 20 2Z" fill="currentColor" /></svg>
      <blockquote className={`text-center italic text-ivory/95 ${large ? "text-3xl leading-relaxed" : "text-lg"}`}>“{b.message}”</blockquote>
      <figcaption className="mt-4 text-center">
        <span className={`font-display uppercase tracking-[0.2em] text-gold ${large ? "text-lg" : "text-sm"}`}>{b.guest_name}</span>
        {b.relationship && <span className="block text-sm italic text-muted-foreground">{b.relationship}</span>}
      </figcaption>
    </figure>
  );
}
