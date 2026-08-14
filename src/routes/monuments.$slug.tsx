import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { Lightbox } from "@/components/site/Lightbox";
import { RouteError, RouteNotFound } from "@/components/site/RouteStates";
import { productQuery, siteContentQuery } from "@/lib/queries";
import { pick, priceLabel, telHref, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/monuments/$slug")({
  loader: async ({ context, params }) => {
    const [data] = await Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.slug)),
      context.queryClient.ensureQueryData(siteContentQuery),
    ]);
    if (!data) throw notFound();
    return { title: data.product.seo_title ?? data.product.title, description: data.product.seo_description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "המצבה לא נמצאה — GALINOS" }, { name: "robots", content: "noindex" }] };
    }
    const description =
      loaderData.description ?? "מצבה בעבודת יד מבית GALINOS — אבן, שיש וגרניט בהתאמה אישית.";
    return {
      meta: [
        { title: `${loaderData.title} — GALINOS` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} — GALINOS` },
        { property: "og:description", content: description },
      ],
    };
  },
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
  component: MonumentDetail,
});

function MonumentDetail() {
  const { slug } = Route.useParams();
  const { data } = useQuery(productQuery(slug));
  const { data: content } = useQuery(siteContentQuery);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const t = content?.texts;
  const s = content?.settings;
  const product = data?.product;
  if (!product) return null;

  const images = [
    ...(product.main_image_url ? [{ image_url: product.main_image_url, alt_text: product.title }] : []),
    ...(data?.images ?? []),
  ];
  const specs = [
    { label: "חומר", value: product.material },
    { label: "מידות", value: product.dimensions },
    { label: "גוון", value: product.color },
    { label: "מקום", value: product.location },
  ].filter((spec) => spec.value);

  const waMessage = `${pick(s, "whatsapp_message", "שלום")} — ${product.title}`;

  return (
    <SiteLayout>
      <PageHeader eyebrow="מצבה" title={product.title} description={product.short_description ?? undefined}>
        <Breadcrumbs items={[{ label: "מצבות", to: "/monuments" }, { label: product.title }]} />
      </PageHeader>

      <section className="container-page pb-24 pt-12 md:pb-32">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <Reveal>
            <div className="grid gap-4">
              {images.length > 0 ? (
                images.map((img, i) => (
                  <button
                    key={`${img.image_url}-${i}`}
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="block aspect-[4/5] w-full overflow-hidden bg-secondary"
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text ?? product.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="size-full object-cover transition-transform duration-[900ms] hover:scale-[1.02]"
                    />
                  </button>
                ))
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-secondary text-xs tracking-[0.2em] text-muted-foreground">
                  GALINOS
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={1} className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-serif text-2xl">
              {priceLabel(product, pick(t, "price_on_request", "מחיר לפי פנייה"))}
            </p>
            {product.description ? (
              <div className="mt-8 space-y-4 text-sm leading-loose text-muted-foreground">
                {product.description.split("\n").map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null))}
              </div>
            ) : null}

            {specs.length > 0 ? (
              <dl className="mt-10 divide-y divide-border border-y border-border text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 py-3">
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-10 flex flex-col gap-3">
              {pick(s, "whatsapp") ? (
                <a
                  href={whatsappHref(pick(s, "whatsapp"), waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm bg-primary px-8 py-3.5 text-center text-sm text-primary-foreground"
                >
                  שליחת פנייה בוואטסאפ
                </a>
              ) : null}
              {pick(s, "phone") ? (
                <a
                  href={telHref(pick(s, "phone"))}
                  className="rounded-sm border border-border px-8 py-3.5 text-center text-sm transition-colors hover:bg-secondary"
                >
                  {pick(s, "phone")}
                </a>
              ) : null}
              <Link to="/contact" className="pt-2 text-center text-xs tracking-[0.18em] text-muted-foreground">
                או מלאו טופס פנייה
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Lightbox
        images={images.map((img) => ({ image_url: img.image_url, title: img.alt_text ?? product.title }))}
        index={lightbox}
        onClose={() => setLightbox(null)}
      />
    </SiteLayout>
  );
}
