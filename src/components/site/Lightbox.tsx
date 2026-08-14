import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Lightbox({
  images,
  index,
  onClose,
}: {
  images: { image_url: string; title?: string | null }[];
  index: number | null;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index ?? 0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (index != null) setCurrent(index);
  }, [index]);

  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose]);

  if (index == null || images.length === 0) return null;
  const image = images[Math.min(current, images.length - 1)];
  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="גלריית תמונות"
      className="fixed inset-0 z-[60] flex flex-col bg-stone-deep/97 backdrop-blur-sm"
      onTouchStart={(e) => setTouchStart(e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStart == null) return;
        const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStart;
        if (Math.abs(delta) > 48) {
          setCurrent((c) => (delta < 0 ? (c + 1) % images.length : (c - 1 + images.length) % images.length));
        }
        setTouchStart(null);
      }}
    >
      <div className="flex items-center justify-between p-5 text-background">
        <span className="text-xs tracking-[0.2em]">
          {current + 1} / {images.length}
        </span>
        <button type="button" onClick={onClose} aria-label="סגירה" className="rounded-full border border-background/40 p-2">
          <X className="size-4" strokeWidth={1.4} />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <img
          src={image.image_url}
          alt={image.title || "עבודה של GALINOS"}
          className="max-h-[78vh] w-auto max-w-full object-contain"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex items-center justify-center gap-6 pb-8 text-background">
          <button
            type="button"
            aria-label="הבא"
            onClick={() => setCurrent((c) => (c + 1) % images.length)}
            className="rounded-full border border-background/40 p-3 transition-colors hover:bg-background/10"
          >
            <ChevronRight className="size-5" strokeWidth={1.4} />
          </button>
          <button
            type="button"
            aria-label="הקודם"
            onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
            className="rounded-full border border-background/40 p-3 transition-colors hover:bg-background/10"
          >
            <ChevronLeft className="size-5" strokeWidth={1.4} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
