import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { table } from "@/lib/admin-db";

export function MessagesPanel() {
  const queryClient = useQueryClient();
  const queryKey = ["admin", "contact_messages"];

  const { data: rows, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await table("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: unknown; status: string }) => {
      const { error } = await table("contact_messages").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: async (id: unknown) => {
      const { error } = await table("contact_messages").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <div>
      <h2 className="font-serif text-2xl">פניות מהאתר</h2>
      <p className="mt-2 text-sm text-muted-foreground">כל הפניות שנשלחו מטופס יצירת הקשר.</p>

      {isLoading ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> טוען…
        </p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {(rows ?? []).map((row) => (
          <li key={String(row['id'])} className="rounded-sm border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-lg">{String(row['full_name'] ?? "")}</p>
                <p className="text-xs text-muted-foreground">
                  {[row['phone'], row['email']].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={String(row['status'] ?? "new")}
                  onChange={(event) => update.mutate({ id: row['id'], status: event.target.value })}
                  className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs"
                >
                  <option value="new">חדש</option>
                  <option value="in_progress">בטיפול</option>
                  <option value="done">טופל</option>
                </select>
                <button
                  type="button"
                  onClick={() => remove.mutate(row['id'])}
                  className="inline-flex items-center gap-1 text-xs text-destructive"
                >
                  <Trash2 className="size-3.5" /> מחיקה
                </button>
              </div>
            </div>
            {row['message'] ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {String(row['message'])}
              </p>
            ) : null}
          </li>
        ))}
        {!isLoading && (rows ?? []).length === 0 ? (
          <li className="text-sm text-muted-foreground">אין פניות חדשות.</li>
        ) : null}
      </ul>
    </div>
  );
}