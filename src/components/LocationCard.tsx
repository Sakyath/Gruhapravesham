import { useQuery } from "@tanstack/react-query";
import { Copy, MapPin, Navigation, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DEFAULT_SETTINGS, settingsQuery } from "@/lib/data";
import { EVENT, fullAddress } from "@/lib/event";

export function LocationCard() {
  const { data } = useQuery(settingsQuery);
  const s = data ?? DEFAULT_SETTINGS;
  const address = fullAddress(s.show_apartment);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied");
    } catch {
      toast.error("Couldn't copy — please select the address manually");
    }
  };
  const share = async () => {
    const text = `Our new home: ${address}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Gruhapravesam location", text, url: EVENT.mapsShareUrl }); } catch { /* cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${EVENT.mapsShareUrl}`)}`, "_blank", "noopener");
    }
  };
  return (
    <div className="royal-card grid overflow-hidden lg:grid-cols-5">
      <div className="relative min-h-[320px] lg:col-span-3">
        <iframe title="Map to ISHA Signature, Ameenpur" src={EVENT.embedUrl} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        <noscript><a href={EVENT.mapsShareUrl}>Open map</a></noscript>
      </div>
      <div className="flex flex-col justify-center gap-5 p-8 lg:col-span-2">
        <div className="flex items-center gap-3 text-gold"><MapPin className="h-6 w-6" /><h2 className="text-xl">{EVENT.building}</h2></div>
        <address className="not-italic text-lg leading-relaxed text-ivory/90">
          {s.show_apartment && <span className="block text-gold-soft">Apartment {EVENT.apartment}</span>}
          {EVENT.addressLines.map((l) => <span key={l} className="block">{l}</span>)}
        </address>
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="royal"><a href={EVENT.directionsUrl} target="_blank" rel="noopener"><Navigation /> Directions</a></Button>
          <Button asChild variant="gilded"><a href={EVENT.mapsShareUrl} target="_blank" rel="noopener"><ExternalLink /> Open Maps</a></Button>
          <Button variant="gilded" onClick={copy}><Copy /> Copy Address</Button>
          <Button variant="gilded" onClick={share}><Share2 /> Share</Button>
        </div>
        <p className="text-sm text-muted-foreground">Map not loading? <a className="text-gold underline" href={EVENT.mapsShareUrl} target="_blank" rel="noopener">Open it in Google Maps</a>.</p>
        <p className="italic text-gold-soft">We look forward to welcoming you to our home.</p>
      </div>
    </div>
  );
}
