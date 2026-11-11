import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Diya } from "@/components/ornaments";
import { adminField } from "@/components/admin/field";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Gruhapravesam 2026" },
      { name: "description", content: "Family dashboard to manage blessings, photos and event details." },
      { property: "og:title", content: "Admin | Gruhapravesam 2026" },
      { property: "og:description", content: "Family dashboard for the Gruhapravesam website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});


function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (session === undefined) return <Center><p className="text-muted-foreground">Loading…</p></Center>;
  if (!session) return <Center><AuthForm /></Center>;
  if (isAdmin === null) return <Center><p className="text-muted-foreground">Checking access…</p></Center>;
  if (!isAdmin)
    return (
      <Center>
        <div className="royal-card max-w-md p-8 text-center">
          <h1 className="text-2xl text-gold-gradient">Access restricted</h1>
          <p className="mt-3 text-muted-foreground">This account ({session.user.email}) isn't a family administrator.</p>
          <Button variant="gilded" className="mt-6" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </Center>
    );
  return <AdminDashboard email={session.user.email ?? ""} />;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center p-4">{children}</div>;
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === "up" && !data.session) setMsg("Check your email to confirm your account, then sign in.");
  };
  return (
    <form onSubmit={submit} className="royal-card w-full max-w-sm space-y-4 p-8">
      <div className="flex justify-center"><Diya size={52} /></div>
      <h1 className="text-center text-2xl text-gold-gradient">Family Admin</h1>
      <p className="text-center text-sm text-muted-foreground">The first account created becomes the administrator.</p>
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={adminField} autoComplete="email" />
      <input type="password" required minLength={8} placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} className={adminField} autoComplete={mode === "in" ? "current-password" : "new-password"} />
      {msg && <p className="text-sm text-gold-soft" role="alert">{msg}</p>}
      <Button type="submit" variant="royal" className="h-11 w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
      <button type="button" className="w-full text-sm text-gold underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
      </button>
      <Link to="/" className="block text-center text-sm text-muted-foreground">← Back to website</Link>
    </form>
  );
}
