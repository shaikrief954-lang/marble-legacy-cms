import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadMedia } from "@/lib/media";

export function MediaInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadMedia(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-sm border border-border bg-secondary">
          {value ? <img src={value} alt={label} className="size-full object-cover" /> : null}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs tracking-wide transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          העלאת תמונה
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" /> הסרה
          </button>
        ) : null}
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="או הדביקו כתובת תמונה"
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function MediaListInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className="flex items-center gap-2">
            <div className="size-14 shrink-0 overflow-hidden rounded-sm border border-border bg-secondary">
              <img src={url} alt="" className="size-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              הסרה
            </button>
          </div>
        ))}
      </div>
      <MediaInput value="" label="תמונה נוספת" onChange={(url) => (url ? onChange([...value, url]) : undefined)} />
    </div>
  );
}