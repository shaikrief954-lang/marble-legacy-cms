import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { table } from "@/lib/admin-db";
import monument1 from "@/assets/monument-1.jpg.asset.json";
import monument2 from "@/assets/monument-2.jpg.asset.json";
import monument3 from "@/assets/monument-3.jpg.asset.json";
import monument4 from "@/assets/monument-4.jpg.asset.json";
import monument5 from "@/assets/monument-5.jpg.asset.json";
import monument6 from "@/assets/monument-6.jpg.asset.json";

const PHOTOS = [
  { url: monument1.url, title: "מצבת אבן בגוון חום־אדמדם", description: "מצבה מאבן מסותתת עם חריטת עוגן ואותיות בעברית, מסגרת חלוקי נחל כהים.", category: "designed" },
  { url: monument2.url, title: "מצבה לבנה עם כותרת מלכות", description: "מצבת אבן לבנה עם חריטת כתר, מסגרת אבן גסה וזכוכית כתושה כחולה.", category: "hebron-stone" },
  { url: monument3.url, title: "מצבה מודרנית שחור־לבן", description: "שילוב שיש שחור מלוטש עם אבן לבנה וכתב עברי שחור.", category: "granite" },
  { url: monument4.url, title: "מצבה עם אותיות תלת־ממד", description: "אבן לבנה מטקסטורה טבעית, אותיות בולטות וזכוכית כתושה ירוקה.", category: "designed" },
  { url: monument5.url, title: "מצבה בשכבות עם לב שחור", description: "שיש לבן ואבן שחורה בשכבות, לב מאבן שחורה ואגרטל לבן.", category: "turkish-marble" },
  { url: monument6.url, title: "מצבה משפחתית כפולה", description: "שני לוחות אבן בהירים עם מגן דוד, מסגרת אבן גסה וחלוקי נחל אדומים.", category: "family" },
];

/** One-click import of the six monument photographs supplied by the client into the gallery. */
export function ImportPhotosPanel() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const { data: gallery } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { data, error } = await table("gallery").select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const existing = new Set((gallery ?? []).map((row) => String(row['image_url'])));
  const missing = PHOTOS.filter((photo) => !existing.has(photo.url));

  const importPhotos = useMutation({
    mutationFn: async () => {
      const { data: categories, error: catError } = await table("categories").select("*");
      if (catError) throw new Error(catError.message);
      const bySlug = new Map((categories ?? []).map((row) => [String(row['slug']), row['id']]));

      let index = (gallery ?? []).length;
      for (const photo of missing) {
        const { error } = await table("gallery").insert({
          title: photo.title,
          description: photo.description,
          image_url: photo.url,
          category_id: bySlug.get(photo.category) ?? null,
          sort_order: index++,
          status: "published",
        });
        if (error) throw new Error(error.message);
      }
      return missing.length;
    },
    onSuccess: async (count) => {
      setMessage(count === 0 ? "כל התמונות כבר קיימות בגלריה." : `יובאו ${count} תמונות לגלריה.`);
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => setMessage(error.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">ייבוא תמונות מצבות</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            ייבוא שש התמונות שנשלחו על ידי הלקוח לגלריית האתר, כולל כותרת, תיאור ושיוך לקטגוריה. אפשר לערוך כל רשומה
            לאחר מכן בלשונית «גלריה».
          </p>
        </div>
        <button
          type="button"
          onClick={() => importPhotos.mutate()}
          disabled={importPhotos.isPending}
          className="inline-flex items-center gap-2 rounded-sm bg-foreground px-5 py-3 text-sm text-background disabled:opacity-60"
        >
          {importPhotos.isPending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          ייבוא תמונות המצבות ({missing.length})
        </button>
      </div>

      {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PHOTOS.map((photo) => (
          <li key={photo.url} className="overflow-hidden rounded-sm border border-border bg-card">
            <img src={photo.url} alt={photo.title} loading="lazy" className="aspect-4/5 w-full object-cover" />
            <div className="p-4">
              <p className="text-sm">{photo.title}</p>
              <p className="mt-1.5 text-[11px] tracking-wide text-muted-foreground">
                {existing.has(photo.url) ? "בגלריה" : "ממתין לייבוא"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
