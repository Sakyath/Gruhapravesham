import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Settings = {
  host_names: string;
  ceremony_time: string;
  lunch_time: string;
  show_apartment: boolean;
  invitation_message: string;
  display_message: string;
  music_url: string;
};

export const DEFAULT_SETTINGS: Settings = {
  host_names: "",
  ceremony_time: "",
  lunch_time: "",
  show_apartment: true,
  invitation_message:
    "With immense happiness, we invite you and your family to join us as we celebrate the auspicious occasion of our new home. Your presence and blessings will make this occasion even more special.",
  display_message: "Welcome to our new home. Thank you for blessing us with your presence.",
  music_url: "",
};

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async (): Promise<Settings> => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
  },
  staleTime: 60_000,
});

export type Blessing = { id: string; guest_name: string; message: string; relationship: string | null; approved: boolean; created_at: string };

export const approvedBlessingsQuery = queryOptions({
  queryKey: ["blessings", "approved"],
  queryFn: async (): Promise<Blessing[]> => {
    const { data, error } = await supabase
      .from("guest_blessings")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  },
});

export type GalleryImage = { id: string; storage_path: string; caption: string | null; category: string; sort_order: number; created_at: string; url: string };

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async (): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data.length) return [];
    const { data: signed } = await supabase.storage
      .from("gallery")
      .createSignedUrls(data.map((d) => d.storage_path), 60 * 60 * 24);
    const map = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    return data.map((d) => ({ ...d, url: map.get(d.storage_path) ?? "" })).filter((d) => d.url);
  },
  staleTime: 10 * 60_000,
});
