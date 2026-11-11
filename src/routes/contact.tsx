import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteShell";
import { SectionTitle, Diya } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { DEFAULT_SETTINGS, settingsQuery } from "@/lib/data";
import { EVENT, fullAddress } from "@/lib/event";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("Contact", "Reach the family and find details for the Gruhapravesam celebration."),
  component: Contact,
});

function Contact() {
  const { data } = useQuery(settingsQuery);
  const s = data ?? DEFAULT_SETTINGS;
  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-4 py-16">
        <SectionTitle eyebrow="Contact" title="We'd Love to Hear From You" />
        <div className="royal-card p-8 text-center sm:p-12">
          <div className="flex justify-center"><Diya size={56} /></div>
          {s.host_names && <p className="mt-4 text-2xl italic text-gold-soft">{s.host_names}</p>}
          <p className="mt-4 text-lg text-ivory/90">{fullAddress(s.show_apartment)}</p>
          <p className="mt-2 font-display text-sm uppercase tracking-[0.25em] text-gold">{EVENT.dateLabel}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="royal"><Link to="/blessings">Send Your Blessings</Link></Button>
            <Button asChild variant="gilded"><a href={EVENT.directionsUrl} target="_blank" rel="noopener">Get Directions</a></Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
