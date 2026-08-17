import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { table, type Row } from "@/lib/admin-db";
import type { Field, Resource } from "./fields";
import { MediaInput, MediaListInput } from "./MediaInput";

function emptyDraft(resource: Resource): Row {
  const draft: Row = { ...(resource.fixed ?? {}) };
  for (const field of resource.fields) {
    if (field.type === "boolean") draft[field.name] = field.name === "is_featured" ? false : true;
    else if (field.type === "number") draft[field.name] = 0;
    else if (field.type === "images" || field.type === "tags") draft[field.name] = [];
    else if (field.type === "select") draft[field.name] = field.options?.[0]?.value ?? "";
    else draft[field.name] = "";
  }
  return draft;
}

function str(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function ResourceManager({ resource }: { resource: Resource }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", resource.key];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row>(() => emptyDraft(resource));
  const [message, setMessage] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = table(resource.table).select("*");
      if (resource.filter) query = query.eq(resource.filter.column, resource.filter.value);
      if (resource.orderBy) query = query.order(resource.orderBy.column, { ascending: resource.orderBy.ascending ?? true });
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  useEffect(() => {
    setSelectedId(null);
    setDraft(emptyDraft(resource));
    setMessage(null);
  }, [resource]);

  const selected = useMemo(
    () => (rows ?? []).find((row) => String(row['id']) === selectedId) ?? null,
    [rows, selectedId],
  );

  function startEdit(row: Row) {
    setSelectedId(String(row['id']));
    setDraft({ ...row });
    setMessage(null);
  }

  function startCreate() {
    setSelectedId(null);
    setDraft(emptyDraft(resource));
    setMessage(null);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload: Row = { ...(resource.fixed ?? {}) };
      for (const field of resource.fields) {
        const value = draft[field.name];
        if (field.type === "number") payload[field.name] = value === "" || value === null ? null : Number(value);
        else if (field.type === "boolean") payload[field.name] = Boolean(value);
        else if (field.type === "images" || field.type === "tags") payload[field.name] = list(value);
        else payload[field.name] = str(value) === "" ? null : str(value);
      }
      if (selected) {
        const { error } = await table(resource.table).update(payload).eq("id", selected['id']);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await table(resource.table).insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      setMessage("נשמר בהצלחה");
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: unknown) => {
      const { error } = await table(resource.table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      startCreate();
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{resource.label}</h2>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-xs text-background"
          >
            <Plus className="size-3.5" /> חדש
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>

        <ul className="mt-6 divide-y divide-border border-y border-border">
          {isLoading ? (
            <li className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> טוען…
            </li>
          ) : null}
          {(rows ?? []).map((row) => (
            <li key={String(row['id'])}>
              <button
                type="button"
                onClick={() => startEdit(row)}
                className={`flex w-full items-center justify-between gap-3 py-3 text-start text-sm transition-colors hover:text-foreground ${
                  String(row['id']) === selectedId ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="truncate">{str(row[resource.titleField]) || "(ללא כותרת)"}</span>
                {row['status'] === "draft" ? <span className="text-[11px] tracking-wide">טיוטה</span> : null}
              </button>
            </li>
          ))}
          {!isLoading && (rows ?? []).length === 0 ? (
            <li className="py-4 text-sm text-muted-foreground">אין רשומות עדיין.</li>
          ) : null}
        </ul>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="rounded-sm border border-border bg-card p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-xl">{selected ? "עריכת רשומה" : "רשומה חדשה"}</h3>
          <div className="flex items-center gap-3">
            {selected ? (
              <button
                type="button"
                onClick={() => remove.mutate(selected['id'])}
                className="inline-flex items-center gap-1.5 text-xs text-destructive"
              >
                <Trash2 className="size-3.5" /> מחיקה
              </button>
            ) : null}
            <button
              type="submit"
              disabled={save.isPending}
              className="inline-flex items-center gap-2 rounded-sm bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-60"
            >
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              שמירה
            </button>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {resource.fields.map((field) => (
            <FieldInput
              key={field.name}
              field={field}
              value={draft[field.name]}
              onChange={(next) => setDraft((prev) => ({ ...prev, [field.name]: next }))}
            />
          ))}
        </div>
      </form>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const inputClass = "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm";
  return (
    <div className={field.span === 2 ? "sm:col-span-2" : undefined}>
      <label className="block text-xs tracking-[0.14em] text-muted-foreground">{field.label}</label>
      <div className="mt-2">
        {field.type === "textarea" ? (
          <textarea rows={5} value={str(value)} onChange={(e) => onChange(e.target.value)} className={inputClass} />
        ) : field.type === "boolean" ? (
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            {Boolean(value) ? "כן" : "לא"}
          </label>
        ) : field.type === "select" ? (
          <select value={str(value)} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === "image" ? (
          <MediaInput value={str(value)} label={field.label} onChange={onChange} />
        ) : field.type === "images" ? (
          <MediaListInput value={list(value)} onChange={onChange} />
        ) : field.type === "tags" ? (
          <textarea
            rows={4}
            value={list(value).join("\n")}
            onChange={(e) => onChange(e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
            className={inputClass}
          />
        ) : (
          <input
            type={field.type === "number" ? "number" : "text"}
            value={str(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        )}
      </div>
      {field.help ? <p className="mt-1.5 text-[11px] text-muted-foreground">{field.help}</p> : null}
    </div>
  );
}