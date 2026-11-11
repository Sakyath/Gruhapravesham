import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { SectionTitle } from "@/components/ornaments";
import { LocationCard } from "@/components/LocationCard";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/location")({
  head: () => pageHead("Location", "Directions to ISHA Signature by TA DO Projects, Ameenpur, Hyderabad."),
  component: () => (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="Location" title="Find Your Way to Our New Home" />
        <LocationCard />
      </section>
    </SiteShell>
  ),
});
