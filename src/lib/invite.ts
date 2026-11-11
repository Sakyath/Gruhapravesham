import { EVENT, fullAddress } from "./event";
import type { Settings } from "./data";

export function icsContent(s: Settings) {
  const desc = [s.invitation_message, s.ceremony_time && `Ceremony: ${s.ceremony_time}`, s.lunch_time && `Lunch: ${s.lunch_time}`]
    .filter(Boolean)
    .join("\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gruhapravesam 2026//EN",
    "BEGIN:VEVENT",
    "UID:gruhapravesam-2026-11-25@invite",
    "DTSTAMP:20261101T000000Z",
    "DTSTART;VALUE=DATE:20261125",
    "DTEND;VALUE=DATE:20261126",
    "SUMMARY:Gruhapravesam – Housewarming Ceremony",
    `DESCRIPTION:${desc}`,
    `LOCATION:${fullAddress(s.show_apartment).replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(s: Settings) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: "Gruhapravesam – Housewarming Ceremony",
    dates: "20261125/20261126",
    details: s.invitation_message,
    location: fullAddress(s.show_apartment),
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = t;
  }
  ctx.fillText(line, x, y);
  return y + lh;
}

/** Renders a 1080x1920 (WhatsApp-story friendly) invitation PNG. */
export async function renderInvitationPng(s: Settings): Promise<Blob> {
  await document.fonts.ready;
  const W = 1080, H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const bg = ctx.createRadialGradient(W / 2, 500, 100, W / 2, 900, 1300);
  bg.addColorStop(0, "#7a1f22");
  bg.addColorStop(1, "#2a0b0d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const gold = ctx.createLinearGradient(0, 0, W, 0);
  gold.addColorStop(0, "#b9893b");
  gold.addColorStop(0.5, "#f7dc9a");
  gold.addColorStop(1, "#b9893b");
  ctx.strokeStyle = gold;
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, W - 128, H - 128);
  // corners
  for (const [x, y] of [[64, 64], [W - 64, 64], [64, H - 64], [W - 64, H - 64]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = gold;
    ctx.fill();
  }
  // diya
  ctx.fillStyle = "#ffcf5a";
  ctx.beginPath();
  ctx.ellipse(W / 2, 230, 22, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, 280);
  ctx.quadraticCurveTo(W / 2, 360, W / 2 + 90, 280);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = gold;
  ctx.font = "600 110px 'Noto Serif Telugu', serif";
  ctx.fillText(EVENT.teluguTitle, W / 2, 500);
  ctx.font = "500 40px Cinzel, serif";
  ctx.fillText("GRUHAPRAVESAM 2026", W / 2, 580);
  ctx.fillStyle = "#f3e7cf";
  ctx.font = "italic 44px 'Cormorant Garamond', serif";
  let y = wrap(ctx, s.invitation_message, W / 2, 700, 820, 62);
  y += 40;
  const rows: [string, string][] = [
    ["DATE", EVENT.dateLabel],
    ["VENUE", EVENT.venueShort],
  ];
  if (s.show_apartment) rows.push(["APARTMENT", EVENT.apartment]);
  if (s.ceremony_time) rows.push(["CEREMONY", s.ceremony_time]);
  if (s.lunch_time) rows.push(["LUNCH", s.lunch_time]);
  for (const [k, v] of rows) {
    ctx.fillStyle = gold;
    ctx.font = "500 30px Cinzel, serif";
    ctx.fillText(k, W / 2, y);
    ctx.fillStyle = "#fff6e3";
    ctx.font = "600 46px 'Cormorant Garamond', serif";
    y = wrap(ctx, v, W / 2, y + 58, 860, 56) + 30;
  }
  if (s.host_names) {
    ctx.fillStyle = gold;
    ctx.font = "500 30px Cinzel, serif";
    ctx.fillText("WITH LOVE", W / 2, y + 20);
    ctx.fillStyle = "#fff6e3";
    ctx.font = "italic 50px 'Cormorant Garamond', serif";
    wrap(ctx, s.host_names, W / 2, y + 85, 860, 60);
  }
  ctx.fillStyle = gold;
  ctx.font = "italic 36px 'Cormorant Garamond', serif";
  ctx.fillText(EVENT.tagline, W / 2, H - 130);
  return new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
}
