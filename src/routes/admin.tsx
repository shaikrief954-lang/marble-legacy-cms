import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { RESOURCES } from "@/components/admin/fields";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { MessagesPanel } from "@/components/admin/MessagesPanel";
import { ContentPanel } from "@/components/admin/ContentPanel";
import { ImportPhotosPanel } from "@/components/admin/ImportPhotosPanel";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ניהול האתר — GALINOS" },
      { name: "description", content: "מערכת ניהול התוכן של GALINOS: מצבות, גלריה, שותפים, טקסטים ופניות." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "ניהול האתר — GALINOS" },
      { property: "og:description", content: "מערכת ניהול התוכן של GALINOS." },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { key: "messages", label: "פניות" },
  { key: "import", label: "ייבוא תמונות" },
  ...RESOURCES.map((resource) => ({ key: resource.key, label: resource.label })),
  { key: "texts", label: "טקסטים" },
  { key: "settings", label: "הגדרות" },
];

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("messages");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  const resource = RESOURCES.find((item) => item.key === tab);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="eyebrow">GALINOS</p>
            <h1 className="font-serif text-2xl">ניהול האתר</h1>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
              לאתר
            </Link>
            <button
              type="button"
              onClick={() => void supabase.auth.signOut()}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-3.5" /> יציאה
            </button>
          </div>
        </div>
        <nav className="container-page flex gap-1 overflow-x-auto pb-3">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`whitespace-nowrap rounded-sm px-3.5 py-2 text-sm transition-colors ${
                tab === item.key ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="container-page py-12">
        {tab === "messages" ? <MessagesPanel /> : null}
        {tab === "import" ? <ImportPhotosPanel /> : null}
        {tab === "texts" ? <ContentPanel mode="texts" /> : null}
        {tab === "settings" ? <ContentPanel mode="settings" /> : null}
        {resource ? <ResourceManager key={resource.key} resource={resource} /> : null}
      </main>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError("אימייל או סיסמה שגויים");
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-sm border border-border bg-background p-8">
        <p className="eyebrow">GALINOS</p>
        <h1 className="mt-4 font-serif text-3xl">כניסה לניהול</h1>
        <p className="mt-3 text-sm text-muted-foreground">הזינו אימייל וסיסמה כדי לנהל את תכני האתר.</p>

        <label className="mt-8 block text-xs tracking-[0.14em] text-muted-foreground" htmlFor="admin-email">
          אימייל
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
        />

        <label className="mt-5 block text-xs tracking-[0.14em] text-muted-foreground" htmlFor="admin-password">
          סיסמה
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
        />

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-foreground px-5 py-3 text-sm text-background disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          כניסה
        </button>
      </form>
    </div>
  );
}