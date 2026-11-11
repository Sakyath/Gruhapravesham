import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SectionTitle, Diya } from "@/components/ornaments";
import { BlessingCard } from "@/components/BlessingCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { approvedBlessingsQuery } from "@/lib/data";
import { blessingSchema, type BlessingInput } from "@/lib/blessing-schema";
import { pageHead } from "@/lib/seo";
import { playSuccess } from "@/lib/sound";

export const Route = createFileRoute("/blessings")({
  head: () => pageHead("Blessings", "Leave your blessings for our new home – every wish makes it more special."),
  component: Blessings,
});

const field = "w-full rounded-xl glass-input px-4 py-3 text-lg text-ivory placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

function Blessings() {
  const { data = [], isLoading } = useQuery(approvedBlessingsQuery);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [honey, setHoney] = useState("");
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<BlessingInput>({
    resolver: zodResolver(blessingSchema) as never,
    defaultValues: { guest_name: "", message: "", relationship: "" },
  });
  const msgLen = (watch("message") ?? "").length;

  const onSubmit = async (raw: BlessingInput) => {
    setErr(null);
    if (honey) { setDone(true); return; }
    const last = Number(localStorage.getItem("gp-last-blessing") ?? 0);
    if (Date.now() - last < 60_000) { setErr("Please wait a minute before sending another blessing."); return; }
    const v = blessingSchema.parse(raw);
    const { error } = await supabase.from("guest_blessings").insert({ guest_name: v.guest_name, message: v.message, relationship: v.relationship || null });
    if (error) { setErr(error.message.includes("Too many") || error.message.includes("wait") ? error.message : "Something went wrong. Please try again."); return; }
    localStorage.setItem("gp-last-blessing", String(Date.now()));
    reset();
    playSuccess();
    setDone(true);
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="Guestbook" title="Leave Your Blessings" subtitle="Every blessing makes our new home more special." />
        <div className="royal-card mx-auto max-w-xl p-6 sm:p-10">
          {done ? (
            <div className="py-6 text-center" role="status">
              <div className="flex justify-center"><Diya size={64} /></div>
              <p className="mt-4 text-2xl italic text-gold-soft">Thank you for your beautiful wishes! Your blessings mean a lot to us.</p>
              <p className="mt-2 text-sm text-muted-foreground">Your message will appear here once the family has seen it.</p>
              <Button variant="gilded" className="mt-6" onClick={() => setDone(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" aria-hidden="true" name="website" />
              <div>
                <label htmlFor="gn" className="mb-1 block font-display text-xs uppercase tracking-[0.25em] text-gold">Your Name *</label>
                <input id="gn" className={field} {...register("guest_name")} maxLength={80} autoComplete="name" />
                {errors.guest_name && <p className="mt-1 text-sm text-destructive">{errors.guest_name.message}</p>}
              </div>
              <div>
                <label htmlFor="rel" className="mb-1 block font-display text-xs uppercase tracking-[0.25em] text-gold">Relationship to the family</label>
                <input id="rel" className={field} placeholder="Friend, cousin, colleague… (optional)" {...register("relationship")} maxLength={60} />
              </div>
              <div>
                <label htmlFor="msg" className="mb-1 block font-display text-xs uppercase tracking-[0.25em] text-gold">Your Blessing *</label>
                <textarea id="msg" rows={5} className={field} {...register("message")} maxLength={500} />
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-destructive">{errors.message?.message}</span>
                  <span className="text-muted-foreground">{msgLen}/500</span>
                </div>
              </div>
              {err && <p className="text-destructive" role="alert">{err}</p>}
              <Button type="submit" variant="royal" size="lg" className="h-12 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send Your Blessings ❤️"}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-16 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {isLoading && <p className="text-center text-muted-foreground">Loading blessings…</p>}
          {!isLoading && !data.length && <p className="text-center italic text-muted-foreground">Be the first to bless our new home.</p>}
          {data.map((b, i) => (
            <motion.div key={b.id} className="mb-5 break-inside-avoid" initial={{ opacity: 0, y: 36, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              <BlessingCard b={b} />
            </motion.div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
