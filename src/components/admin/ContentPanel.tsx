import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { table, type Row } from "@/lib/admin-db";

/** Editor for the key/value tables: site_texts (Hebrew copy) and site_settings (contact details). */
export function ContentPanel({ mode }: { mode: "texts" | "settings" }) {
  const queryClient = useQueryClient();
  const isTexts = mode === "texts";
  const tableName = isTexts ? "site_texts" : "site_settings";
  const queryKey = ["admin", tableName];
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await table(tableName).select("*").order("key", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!rows) return;
    const next: Record<string, string> = {};
    for (const row of rows) {
      const key = String(row['key']);
      next[key] = String((isTexts ? row['value_he'] : row['value']) ?? "");
    }
    setValues(next);
  }, [rows, isTexts]);

  const save = useMutation({
    mutationFn: async () => {
      for (const row of rows ?? []) {
        const key = String(row['key']);
        const current = String((isTexts ? row['value_he'] : row['value']) ?? "");
        const next = values[key] ?? "";
        if (next === current) continue;
        const payload: Row = isTexts ? { value_he: next } : { value: next };
        const { error } = await table(tableName).update(payload).eq("key", key);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      setMessage("נשמר בהצלחה");
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">{isTexts ? "טקסטים באתר" : "הגדרות ופרטי קשר"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isTexts
              ? "כל הכותרות והפסקאות המופיעות בעמודי האתר."
              : "טלפון, וואטסאפ, אימייל, כתובת, שעות פעילות וקישורים."}
          </p>
        </div>
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-sm bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          שמירת שינויים
        </button>
      </div>

      {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
      {isLoading ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> טוען…
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {(rows ?? []).map((row) => {
          const key = String(row['key']);
          const label = String(row['label'] ?? key);
          const value = values[key] ?? "";
          const long = value.length > 70;
          return (
            <div key={key} className={long ? "lg:col-span-2" : undefined}>
              <label className="block text-xs tracking-[0.14em] text-muted-foreground">
                {label} <span className="opacity-60">({key})</span>
              </label>
              {long ? (
                <textarea
                  rows={4}
                  value={value}
                  onChange={(event) => setValues((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                />
              ) : (
                <input
                  value={value}
                  onChange={(event) => setValues((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </form>
  );
}