import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { Lightbox } from "@/components/site/Lightbox";
import { RouteError } from "@/components/site/RouteStates";
import { categoriesQuery, galleryQuery, productsQuery, siteContentQuery } from "@/lib/queries";
import { pick } from "@/lib/site";

export const Route = createFileRoute("/gallery")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(galleryQuery),
      context.queryClient.ensureQueryData(productsQuery()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "גלריית עבודות — מצבות אבן ושיש | GALINOS" },
      {
        name: "description",
        content: "גלריית העבודות של גלינוס: מצבות שיש, גרניט ואבן חברון, חריטה בעבודת יד ופרויקטים משפחתיים.",
      },
      { property: "og:title", content: "גלריית עבודות — GALINOS" },
      { property: "og:description", content: "מצבות שיש, גרניט ואבן חברון בעבודת יד." },
    ],
  }),
  errorComponent: RouteError,
  component: Gallery,
});

function Gallery() {
  const { data: content } = useQuery(siteContentQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: gallery } = useQuery(galleryQuery);
  const { data: products } = useQuery(productsQuery());
  const [filter, setFilter] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const t = content?.texts;

  const items = useMemo(() => {
    const fromGallery = (gallery ?? []).map((g) => ({
      image_url: g.image_url,
      title: g.title,
      category_id: g.category_id,
    }));
    const fromProducts = (products ?? [])
      .filter((p) => p.main_image_url)
      .map((p) => ({ image_url: p.main_image_url as string, title: p.title, category_id: p.category_id }));
    const all = [...fromGallery, ...fromProducts];
    return filter ? all.filter((item) => item.category_id === filter) : all;
  }, [gallery, products, filter]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="גלריה"
        title={pick(t, "gallery_title", "העבודות שלנו")}
        description={pick(t, "gallery_subtitle")}
      >
        <Breadcrumbs items={[{ label: "עבודות" }]} />
      </PageHeader>

      <section className="container-page pb-24 pt-12 md:pb-32">
        <div className="flex flex-wrap gap-2 border-b border-border pb-8">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`rounded-sm border px-4 py-2 text-xs tracking-wide transition-colors ${
              !filter ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
            }`}
          >
            הכל
          </button>
          {(categories ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`rounded-sm border px-4 py-2 text-xs tracking-wide transition-colors ${
                filter === c.id ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="py-24 text-center text-sm text-muted-foreground">
            תמונות נוספות יתווספו בקרוב דרך ממשק הניהול.
          </p>
        ) : (
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((item, i) => (
              <Reveal key={`${item.image_url}-${i}`} delay={((i % 3) + 1) as 1 | 2 | 3} className="mb-4 break-inside-avoid">
                <button type="button" onClick={() => setLightbox(i)} className="block w-full overflow-hidden bg-secondary">
                  <img
                    src={item.image_url}
                    alt={item.title ?? "עבודת אבן של GALINOS"}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-[900ms] hover:scale-[1.03]"
                  />
                </button>
                {item.title ? <p className="mt-2 text-sm text-muted-foreground">{item.title}</p> : null}
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <Lightbox images={items} index={lightbox} onClose={() => setLightbox(null)} />
    </SiteLayout>
  );
}
