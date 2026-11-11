import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarPlus, Download, Eye, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Diya, Divider, MandalaCorner } from "./ornaments";
import { DEFAULT_SETTINGS, settingsQuery } from "@/lib/data";
import { EVENT } from "@/lib/event";
import { downloadBlob, googleCalendarUrl, icsContent, renderInvitationPng } from "@/lib/invite";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-[0.7rem] uppercase tracking-[0.3em] text-gold/80">{label}</p>
      <p className="text-xl text-ivory">{value}</p>
    </div>
  );
}

export function InvitationCard({ showActions = true, showView = true }: { showActions?: boolean; showView?: boolean }) {
  const { data } = useQuery(settingsQuery);
  const s = data ?? DEFAULT_SETTINGS;
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      downloadBlob(await renderInvitationPng(s), "Gruhapravesam-2026-Invitation.png");
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    const url = `${window.location.origin}/invitation`;
    const text = `${EVENT.teluguTitle} – You're invited to our Gruhapravesam on ${EVENT.dateLabel} at ${EVENT.venueShort}.`;
    try {
      const blob = await renderInvitationPng(s);
      const file = new File([blob], "Gruhapravesam-Invitation.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text} ${url}` });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: EVENT.name, text, url });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener");
  };
  const calendar = () => {
    downloadBlob(new Blob([icsContent(s)], { type: "text/calendar" }), "Gruhapravesam-2026.ics");
    toast("Calendar file downloaded", {
      action: { label: "Google Calendar", onClick: () => window.open(googleCalendarUrl(s), "_blank", "noopener") },
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <article className="royal-card overflow-hidden px-6 py-12 text-center sm:px-12">
        <MandalaCorner className="left-3 top-3" />
        <MandalaCorner className="right-3 top-3 -scale-x-100" />
        <MandalaCorner className="bottom-3 left-3 -scale-y-100" />
        <MandalaCorner className="bottom-3 right-3 -scale-100" />
        <div className="flex justify-center"><Diya size={56} /></div>
        <h2 className="font-te mt-2 text-4xl leading-relaxed text-gold-gradient sm:text-5xl">{EVENT.teluguTitle}</h2>
        <Divider className="my-5" />
        <p className="text-lg italic leading-relaxed text-ivory/90 sm:text-xl">{s.invitation_message}</p>
        <div className="mt-8 grid gap-5">
          <Row label="Date" value={EVENT.dateLabel} />
          <Row label="Venue" value={EVENT.venueShort} />
          {s.show_apartment && <Row label="Apartment" value={EVENT.apartment} />}
          {s.ceremony_time && <Row label="Ceremony" value={s.ceremony_time} />}
          {s.lunch_time && <Row label="Lunch" value={s.lunch_time} />}
        </div>
        {s.host_names && (
          <>
            <Divider className="my-6" />
            <p className="font-display text-[0.7rem] uppercase tracking-[0.3em] text-gold/80">With love</p>
            <p className="mt-1 text-2xl italic text-gold-soft">{s.host_names}</p>
          </>
        )}
      </article>
      {showActions && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
          {showView && (
            <Button asChild variant="gilded"><Link to="/invitation"><Eye /> View Invitation</Link></Button>
          )}
          <Button variant="gilded" onClick={download} disabled={busy}><Download /> {busy ? "Preparing…" : "Download"}</Button>
          <Button variant="gilded" onClick={share}><Share2 /> Share</Button>
          <Button variant="gilded" onClick={calendar}><CalendarPlus /> Add to Calendar</Button>
        </div>
      )}
    </div>
  );
}
