import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DEFAULT_SETTINGS, galleryQuery, settingsQuery, type Blessing, type Settings } from "@/lib/data";
import { GALLERY_CATEGORIES } from "@/lib/event";
import { adminField } from "./field";
import { QrPanel } from "./QrPanel";

const TABS = ["Blessings", "Gallery", "Event Details", "Music", "QR & Print"] as const;

export function AdminDashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Blessings");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gold-gradient">Family Dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="gilded" size="sm"><Link to="/" target="_blank">Preview website</Link></Button>
          <Button asChild variant="gilded" size="sm"><Link to="/display" target="_blank">Open TV display</Link></Button>
          <Button variant="gilded" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </header>
      <nav className="my-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-2 font-display text-xs uppercase tracking-[0.15em] ${tab === t ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-ivory/80"}`}>{t}</button>
        ))}
      </nav>
      {tab === "Blessings" && <BlessingsPanel />}
      {tab === "Gallery" && <GalleryPanel />}
      {tab === "Event Details" && <SettingsPanel />}
      {tab === "Music" && <MusicPanel />}
      {tab === "QR & Print" && <QrPanel />}
    </div>
  );
}

function BlessingsPanel() {
  const qc = useQueryClient();
  const { data = [], refetch } = useQuery({
    queryKey: ["admin-blessings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guest_blessings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Blessing[];
    },
  });
  const pending = data.filter((b) => !b.approved);
  const act = async (id: string, kind: "approve" | "unapprove" | "delete") => {
    const { error } = kind === "delete"
      ? await supabase.from("guest_blessings").delete().eq("id", id)
      : await supabase.from("guest_blessings").update({ approved: kind === "approve" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    await refetch();
    qc.invalidateQueries({ queryKey: ["blessings"] });
  };
  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[["Total", data.length], ["Pending", pending.length], ["Approved", data.length - pending.length]].map(([k, v]) => (
          <div key={k} className="royal-card p-5 text-center"><p className="text-3xl text-gold-gradient font-display">{v}</p><p className="text-sm text-muted-foreground">{k}</p></div>
        ))}
      </div>
      <div className="space-y-3">
        {!data.length && <p className="italic text-muted-foreground">No blessings yet.</p>}
        {data.map((b) => (
          <div key={b.id} className="royal-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-display text-sm text-gold">{b.guest_name} {b.relationship && <span className="italic text-muted-foreground">· {b.relationship}</span>}</p>
              <p className="mt-1 text-ivory/90">{b.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} · {b.approved ? "Approved" : "Pending"}</p>
            </div>
            <div className="flex gap-2">
              {b.approved
                ? <Button size="sm" variant="gilded" onClick={() => act(b.id, "unapprove")}><X /> Hide</Button>
                : <Button size="sm" variant="royal" onClick={() => act(b.id, "approve")}><Check /> Approve</Button>}
              <Button size="sm" variant="destructive" onClick={() => confirm("Delete this blessing?") && act(b.id, "delete")}><Trash2 /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(galleryQuery);
  const [cat, setCat] = useState<string>(GALLERY_CATEGORIES[0]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["gallery"] });

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} isn't an image`); continue; }
      const path = `${crypto.randomUUID()}.${f.name.split(".").pop()?.toLowerCase() || "jpg"}`;
      const up = await supabase.storage.from("gallery").upload(path, f, { contentType: f.type });
      if (up.error) { toast.error(up.error.message); continue; }
      const { error } = await supabase.from("gallery_images").insert({ storage_path: path, category: cat, caption: caption.trim() || null });
      if (error) toast.error(error.message);
    }
    setBusy(false);
    setCaption("");
    toast.success("Upload complete");
    refresh();
  };
  const update = async (id: string, patch: { caption?: string; category?: string }) => {
    const { error } = await supabase.from("gallery_images").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Saved"); refresh(); }
  };
  const remove = async (id: string, path: string) => {
    if (!confirm("Delete this photo?")) return;
    await supabase.storage.from("gallery").remove([path]);
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <div>
      <div className="royal-card mb-8 grid gap-4 p-6 sm:grid-cols-3">
        <select className={adminField} value={cat} onChange={(e) => setCat(e.target.value)}>
          {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input className={adminField} placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={140} />
        <label className="btn-royal flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5">
          <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload photos"}
          <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(e) => upload(e.target.files)} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!data.length && <p className="italic text-muted-foreground">No photos yet.</p>}
        {data.map((img) => <GalleryItem key={img.id} img={img} onSave={update} onDelete={remove} />)}
      </div>
    </div>
  );
}

function GalleryItem({ img, onSave, onDelete }: { img: { id: string; url: string; caption: string | null; category: string; storage_path: string }; onSave: (id: string, p: { caption?: string; category?: string }) => void; onDelete: (id: string, p: string) => void }) {
  const [caption, setCaption] = useState(img.caption ?? "");
  const [category, setCategory] = useState(img.category);
  return (
    <div className="royal-card overflow-hidden">
      <img src={img.url} alt={img.caption ?? ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />
      <div className="space-y-2 p-4">
        <input className={adminField} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" maxLength={140} />
        <select className={adminField} value={category} onChange={(e) => setCategory(e.target.value)}>
          {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <Button size="sm" variant="royal" className="flex-1" onClick={() => onSave(img.id, { caption: caption.trim(), category })}>Save</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(img.id, img.storage_path)}><Trash2 /></Button>
        </div>
      </div>
    </div>
  );
}

function useSettingsForm() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [form, setForm] = useState<Settings | null>(null);
  const s = form ?? data ?? DEFAULT_SETTINGS;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm({ ...s, [k]: v });
  const save = async (patch?: Partial<Settings>) => {
    const next = { ...s, ...patch };
    const { error } = await supabase.from("site_settings").update({ ...next, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setForm(null);
    qc.invalidateQueries({ queryKey: ["settings"] });
  };
  return { s, set, save };
}

function SettingsPanel() {
  const { s, set, save } = useSettingsForm();
  const L = ({ children }: { children: React.ReactNode }) => <span className="mb-1 block font-display text-xs uppercase tracking-[0.2em] text-gold">{children}</span>;
  return (
    <form className="royal-card space-y-5 p-6 sm:p-8" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <label className="block"><L>Host / family names</L><input className={adminField} value={s.host_names} onChange={(e) => set("host_names", e.target.value)} placeholder="e.g. The ___ Family" maxLength={160} /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><L>Ceremony time</L><input className={adminField} value={s.ceremony_time} onChange={(e) => set("ceremony_time", e.target.value)} placeholder="e.g. 6:30 AM – 8:00 AM" maxLength={80} /></label>
        <label className="block"><L>Lunch time</L><input className={adminField} value={s.lunch_time} onChange={(e) => set("lunch_time", e.target.value)} placeholder="e.g. 12:30 PM onwards" maxLength={80} /></label>
      </div>
      <label className="block"><L>Invitation message</L><textarea rows={4} className={adminField} value={s.invitation_message} onChange={(e) => set("invitation_message", e.target.value)} maxLength={600} /></label>
      <label className="block"><L>TV display welcome message</L><textarea rows={2} className={adminField} value={s.display_message} onChange={(e) => set("display_message", e.target.value)} maxLength={300} /></label>
      <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-gold" checked={s.show_apartment} onChange={(e) => set("show_apartment", e.target.checked)} /><span>Show apartment number (202) publicly</span></label>
      <Button type="submit" variant="royal" className="h-11 px-8">Save changes</Button>
    </form>
  );
}

function MusicPanel() {
  const { s, save } = useSettingsForm();
  const [busy, setBusy] = useState(false);
  const upload = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) { toast.error("Please choose an audio file"); return; }
    setBusy(true);
    const path = `music/${crypto.randomUUID()}.${f.name.split(".").pop() || "mp3"}`;
    const up = await supabase.storage.from("gallery").upload(path, f, { contentType: f.type });
    if (up.error) { setBusy(false); toast.error(up.error.message); return; }
    const { data } = await supabase.storage.from("gallery").createSignedUrl(path, 60 * 60 * 24 * 365);
    setBusy(false);
    if (data?.signedUrl) save({ music_url: data.signedUrl });
  };
  return (
    <div className="royal-card space-y-4 p-6 sm:p-8">
      <p className="text-ivory/90">Guests turn music on with the button in the corner — it never autoplays. Without an uploaded track, a gentle tanpura-style drone plays.</p>
      <p className="text-sm text-muted-foreground">Only upload music you own or have permission to use.</p>
      <p>Current: <span className="text-gold">{s.music_url ? "Uploaded track" : "Built-in tanpura drone"}</span></p>
      {s.music_url && <audio controls src={s.music_url} className="w-full" />}
      <div className="flex flex-wrap gap-3">
        <label className="btn-royal flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5"><Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload track"}
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} /></label>
        {s.music_url && <Button variant="gilded" onClick={() => save({ music_url: "" })}>Use built-in drone</Button>}
      </div>
    </div>
  );
}
