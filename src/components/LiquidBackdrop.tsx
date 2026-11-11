import { useEffect, useRef } from "react";
import backdrop from "@/assets/glass-backdrop.jpg";
import { playTap } from "@/lib/sound";

/**
 * Fixed, softly moving scene behind every page so the glass panels have
 * something rich to blur: bokeh photo + drifting light orbs + parallax.
 * Also drives the cursor-following sheen on glass cards and button tap sounds.
 */
export function LiquidBackdrop() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.(".royal-card") as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          layer.current?.style.setProperty("transform", `translate3d(${px * -28}px, ${py * -22}px, 0)`);
        });
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("button, a, [role=button]");
      if (el && !el.hasAttribute("data-silent")) playTap();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onClick, true);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img src={backdrop} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover animate-kenburns" />
      <div ref={layer} className="absolute -inset-16 transition-transform duration-700 ease-out">
        <div className="absolute -left-[10vw] top-[5vh] h-[60vmax] w-[60vmax] rounded-full bg-orb-gold mix-blend-screen blur-3xl animate-drift-a" />
        <div className="absolute -right-[15vw] top-[30vh] h-[55vmax] w-[55vmax] rounded-full bg-orb-rose mix-blend-screen blur-3xl animate-drift-b" />
        <div className="absolute bottom-[-20vh] left-[25vw] h-[50vmax] w-[50vmax] rounded-full bg-orb-saffron mix-blend-screen blur-3xl animate-drift-c" />
        <div className="absolute left-[40vw] top-[-20vh] h-[45vmax] w-[45vmax] rounded-full bg-orb-wine blur-3xl animate-drift-b" />
      </div>
      <div className="absolute inset-0 bg-glass-veil" />
    </div>
  );
}
