import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { InvitationCard } from "@/components/InvitationCard";
import { Countdown } from "@/components/Countdown";
import { SectionTitle } from "@/components/ornaments";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/invitation")({
  head: () => pageHead("Invitation", "Our digital Gruhapravesam invitation for Wednesday, 25 November 2026."),
  component: () => (
    <SiteShell>
      <section className="px-4 py-16">
        <SectionTitle eyebrow="You are invited" title="Our Invitation" subtitle="Your presence and blessings will make this occasion even more special." />
        <InvitationCard showView={false} />
        <div className="mt-20"><Countdown /></div>
      </section>
    </SiteShell>
  ),
});
