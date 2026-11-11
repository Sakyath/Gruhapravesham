import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Entrance } from "@/components/Entrance";
import { SiteShell } from "@/components/SiteShell";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/Reveal";
import { InvitationCard } from "@/components/InvitationCard";
import { Diya, Divider, Mandala } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import entrance from "@/assets/home-entrance.jpg";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gruhapravesam 2026 | Welcome to Our Dream Home" },
      { name: "description", content: "శుభ గృహప్రవేశం – A New Beginning, A Lifetime of Memories. 25 November 2026, Hyderabad." },
      { property: "og:title", content: "Gruhapravesam 2026 | Welcome to Our Dream Home" },
      { property: "og:description", content: "You're warmly invited to our housewarming on 25 November 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const item = {
  hidden: { opacity: 0, y: 22, filter: "blur(10px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const }, transitionEnd: { filter: "none" } },
};

function HostLine() {
  const { data } = useQuery(settingsQuery);
  if (!data?.host_names) return null;
  return <p className="mx-auto mt-4 max-w-2xl text-lg italic text-gold-soft sm:text-xl">With love, {data.host_names}</p>;
}

function Index() {
  const [entered, setEntered] = useState<boolean | null>(null);
  useEffect(() => {
    setEntered(sessionStorage.getItem("gp-entered") === "1");
  }, []);
  const enter = () => {
    sessionStorage.setItem("gp-entered", "1");
    setEntered(true);
  };

  return (
    <>
      {entered === false && <Entrance onEnter={enter} />}
      <SiteShell>
        <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-10 text-center">
          <Mandala className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[120vw] max-h-[760px] w-[120vw] max-w-[760px] -translate-x-1/2 -translate-y-1/2 animate-slow-spin text-gold/[0.06]" />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={entered !== false ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="royal-card relative w-full max-w-4xl px-5 py-8 sm:px-10 sm:py-10"
          >
            <motion.div
              variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }}
              initial="hidden"
              animate={entered !== false ? "shown" : "hidden"}
            >
              <motion.div variants={item} className="relative flex items-end justify-center gap-6">
                <span className="absolute left-1/2 top-1/2 h-32 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orb-gold blur-2xl animate-halo" />
                <Diya size={40} className="relative" />
                <Diya size={54} className="relative" />
                <Diya size={40} className="relative" />
              </motion.div>
              <motion.h1 variants={item} className="font-te mt-2 text-5xl leading-[1.4] text-gold-shimmer sm:text-6xl lg:text-7xl [@media(max-height:760px)]:lg:text-6xl">{EVENT.teluguTitle}</motion.h1>
              <motion.p variants={item} className="mt-1 font-display text-2xl text-ivory sm:text-4xl">{EVENT.englishTitle}</motion.p>
              <motion.div variants={item}><Divider className="my-4" /></motion.div>
              <motion.p variants={item} className="text-xl italic text-gold-soft sm:text-2xl">{EVENT.tagline}</motion.p>
              <motion.p variants={item} className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">{EVENT.secondaryTagline}</motion.p>
              <motion.p variants={item} className="glass-pill mt-5 inline-block rounded-full px-6 py-2 font-display text-sm uppercase tracking-[0.3em] text-gold">
                {EVENT.dateLabel}
              </motion.p>
              <motion.div variants={item}><HostLine /></motion.div>
              <motion.div variants={item} className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild variant="royal" size="lg" className="h-12 px-8"><Link to="/invitation">View Invitation</Link></Button>
                <Button asChild variant="gilded" size="lg" className="h-12"><Link to="/location">Find Our Home</Link></Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <Reveal className="px-4 py-16">
          <Countdown />
        </Reveal>

        <Reveal className="px-4 py-16">
          <InvitationCard />
        </Reveal>

        <Reveal className="mx-auto max-w-6xl px-4 py-16">
          <div className="royal-card grid overflow-hidden md:grid-cols-2">
            <img src={entrance} alt="Decorated entrance with marigold toran, diyas and rangoli" width={1536} height={1024} loading="lazy" className="h-full min-h-64 w-full object-cover" />
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="font-display text-xs uppercase tracking-[0.35em] text-gold/80">Our Home</p>
              <h2 className="mt-3 text-3xl text-gold-gradient sm:text-4xl">A Place We Call Home</h2>
              <p className="mt-4 text-lg text-muted-foreground">Step inside the dream we've been building — and leave a blessing that will stay with us forever.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="gilded"><Link to="/our-home">Explore</Link></Button>
                <Button asChild variant="gilded"><Link to="/blessings">Leave a Blessing</Link></Button>
              </div>
            </div>
          </div>
        </Reveal>
      </SiteShell>
    </>
  );
}
