// Fixed event facts supplied by the family. Editable details (hosts, timings) live in site settings.
export const EVENT = {
  name: "Gruhapravesam 2026",
  teluguTitle: "శుభ గృహప్రవేశం",
  englishTitle: "Welcome to Our Dream Home",
  tagline: "A New Beginning, A Lifetime of Memories.",
  secondaryTagline:
    "With the blessings of the Almighty and the love of our family, we welcome you to celebrate our new home.",
  dateLabel: "Wednesday, 25 November 2026",
  dateShort: "25 November 2026",
  // 25 Nov 2026 00:00 IST = 24 Nov 2026 18:30 UTC
  startUtc: Date.UTC(2026, 10, 24, 18, 30, 0),
  endUtc: Date.UTC(2026, 10, 25, 18, 30, 0),
  apartment: "202",
  building: "ISHA Signature by TA DO Projects",
  venueShort: "ISHA Signature, Ameenpur, Hyderabad",
  addressLines: [
    "ISHA Signature by TA DO Projects,",
    "Road Number 3, SRE, Plot 50D, West, Near Padmavati School,",
    "Ameenpur, Miyapur, Hyderabad,",
    "Telangana – 502033, India.",
  ],
  mapsShareUrl: "https://maps.app.goo.gl/JbxwXvjK8cAsteGXA",
  mapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=ISHA+Signature+by+TA+DO+Projects+Ameenpur+Hyderabad",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=ISHA+Signature+by+TA+DO+Projects+Ameenpur+Hyderabad",
  embedUrl:
    "https://maps.google.com/maps?q=ISHA+Signature+by+TA+DO+Projects+Ameenpur+Hyderabad&z=16&output=embed",
};

export function fullAddress(showApartment: boolean) {
  const lines = [...EVENT.addressLines];
  if (showApartment) lines[0] = `Apartment ${EVENT.apartment}, ${lines[0]}`;
  return lines.join(" ");
}

export const GALLERY_CATEGORIES = [
  "Our New Home",
  "Living Room",
  "Family Moments",
  "Gruhapravesam Ceremony",
  "Friends and Relatives",
  "Special Memories",
] as const;
