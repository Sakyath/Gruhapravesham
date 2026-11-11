import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/invite";
import { EVENT } from "@/lib/event";
import { adminField } from "./field";

const MAROON = "#3a0f12";
const GOLD = "#c9a24d";

async function framedCanvas(url: string, kind: "qr" | "poster") {
  await document.fonts.ready;
  const W = kind === "qr" ? 1600 : 2480, H = kind === "qr" ? 1900 : 3508; // poster = A4 @300dpi
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = MAROON; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GOLD; ctx.lineWidth = W / 120; ctx.strokeRect(W * 0.03, W * 0.03, W * 0.94, H - W * 0.06);
  ctx.lineWidth = W / 400; ctx.strokeRect(W * 0.05, W * 0.05, W * 0.9, H - W * 0.1);
  // floral corners
  for (const [x, y] of [[W * 0.05, W * 0.05], [W * 0.95, W * 0.05], [W * 0.05, H - W * 0.05], [W * 0.95, H - W * 0.05]] as [number, number][]) {
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); ctx.ellipse(x + Math.cos((i * Math.PI) / 4) * W * 0.02, y + Math.sin((i * Math.PI) / 4) * W * 0.02, W * 0.012, W * 0.006, (i * Math.PI) / 4, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? "#f97316" : "#f59e0b"; ctx.fill();
    }
  }
  ctx.textAlign = "center"; ctx.fillStyle = GOLD;
  const qrSize = kind === "qr" ? 1100 : 1500;
  const qrTop = kind === "qr" ? 420 : 1250;
  if (kind === "poster") {
    ctx.font = `600 ${W * 0.08}px 'Noto Serif Telugu', serif`; ctx.fillText(EVENT.teluguTitle, W / 2, 620);
    ctx.font = `500 ${W * 0.05}px Cinzel, serif`; ctx.fillText("Welcome to Our Home", W / 2, 900);
    ctx.font = `italic ${W * 0.03}px 'Cormorant Garamond', serif`; ctx.fillStyle = "#f3e7cf"; ctx.fillText(EVENT.dateLabel, W / 2, 1060);
  } else {
    ctx.font = `600 ${W * 0.07}px 'Noto Serif Telugu', serif`; ctx.fillText(EVENT.teluguTitle, W / 2, 300);
  }
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, url, { width: qrSize, margin: 2, errorCorrectionLevel: "H", color: { dark: MAROON, light: "#fffaf0" } });
  ctx.fillStyle = GOLD; ctx.fillRect(W / 2 - qrSize / 2 - 20, qrTop - 20, qrSize + 40, qrSize + 40);
  ctx.drawImage(qr, W / 2 - qrSize / 2, qrTop);
  ctx.fillStyle = GOLD;
  ctx.font = `600 ${W * 0.035}px Cinzel, serif`;
  ctx.fillText(kind === "qr" ? "SCAN TO ENTER OUR CELEBRATION" : "Scan to Explore Our Celebration", W / 2, qrTop + qrSize + (kind === "qr" ? 170 : 260));
  return c;
}

export function QrPanel() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState("");
  useEffect(() => setUrl(window.location.origin), []);
  useEffect(() => {
    if (!url) return;
    framedCanvas(url, "qr").then((c) => setPreview(c.toDataURL("image/png"))).catch(() => setPreview(""));
  }, [url]);
  const temp = /preview|lovableproject\.com|localhost/.test(url);
  const png = async (kind: "qr" | "poster") => {
    const c = await framedCanvas(url, kind);
    c.toBlob((b) => b && downloadBlob(b, kind === "qr" ? "Gruhapravesam-QR.png" : "Gruhapravesam-Welcome-Poster.png"), "image/png");
  };
  const svg = async () => {
    const s = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "H", color: { dark: MAROON, light: "#fffaf0" } });
    downloadBlob(new Blob([s], { type: "image/svg+xml" }), "Gruhapravesam-QR.svg");
  };
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="royal-card space-y-4 p-6">
        <label className="block">
          <span className="mb-1 block font-display text-xs uppercase tracking-[0.2em] text-gold">Website address for the QR code</span>
          <input className={adminField} value={url} onChange={(e) => setUrl(e.target.value.trim())} />
        </label>
        {temp && <p className="text-sm text-gold-soft">This looks like a temporary preview address. Publish the website first, then open this dashboard on the published address (or paste it above) before printing.</p>}
        <div className="flex flex-wrap gap-3">
          <Button variant="royal" onClick={() => png("qr")} disabled={!url}>Download PNG (high-res)</Button>
          <Button variant="gilded" onClick={svg} disabled={!url}>Download SVG</Button>
          <Button variant="gilded" onClick={() => png("poster")} disabled={!url}>Download entrance poster (A4)</Button>
        </div>
      </div>
      <div className="flex justify-center">{preview && <img src={preview} alt="QR code preview" className="max-h-[520px] rounded-lg shadow-royal" />}</div>
    </div>
  );
}
