import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown } from "lucide-react";
import heroStone from "@/assets/hero-stone.jpg";
import workshop from "@/assets/workshop.jpg";
import engraving from "@/assets/detail-engraving.jpg";
import granite360 from "@/assets/granite-360.mp4.asset.json";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Parallax } from "@/components/site/Parallax";
import { RouteError } from "@/components/site/RouteStates";
import {
  categoriesQuery,
  directoryQuery,
  galleryQuery,
  landingPagesQuery,
  materialsQuery,
  processQuery,
  productsQuery,
  servicesQuery,
  siteContentQuery,
} from "@/lib/queries";
import { pick } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(processQuery),
      context.queryClient.ensureQueryData(materialsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(productsQuery()),
      context.queryClient.ensureQueryData(galleryQuery),
      context.queryClient.ensureQueryData(directoryQuery("supplier")),
      context.queryClient.ensureQueryData(landingPagesQuery()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "GALINOS — מצבות באבן ובשיש | עיצוב, ייצור והתקנה" },
      {
        name: "description",
        content:
          "GALINOS — מצבות באבן, בשיש ובגרניט. תכנון בהתאמה אישית, חריטה בעבודת יד, שיפוץ מצבות והתקנה מקצועית, בליווי מכבד לכל אורך הדרך.",
      },
      { property: "og:title", content: "GALINOS — מצבות באבן ובשיש" },
      {
        property: "og:description",
        content: "עיצוב, ייצור והתקנה של מצבות בהתאמה אישית, באבן, בשיש ובגרניט.",
      },
    ],
  }),
  errorComponent: RouteError,
  component: Home,
});

function Home() {
  const { data: content } = useQuery(siteContentQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: steps } = useQuery(processQuery);
  const { data: materials } = useQuery(materialsQuery);
  const { data: services } = useQuery(servicesQuery);
  const { data: products } = useQuery(productsQuery());
  const { data: gallery } = useQuery(galleryQuery);
  const { data: suppliers } = useQuery(directoryQuery("supplier"));
  const { data: landingPages } = useQuery(landingPagesQuery());

  const t = content?.texts;
  const trustItems = pick(t, "trust_items")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  const works = [
    ...(products ?? [])
      .filter((p) => p.main_image_url)
      .map((p) => ({ image: p.main_image_url as string, label: p.title, to: p.slug })),
    ...(gallery ?? []).map((g) => ({ image: g.image_url, label: g.title ?? "", to: null })),
  ].slice(0, 6);

  return (
    <SiteLayout overlayHeader>
      {/* HERO */}
      <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
        <Parallax className="absolute inset-0" strength={0.18}>
          <video
            src={granite360.url}
            poster={heroStone}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="סבב 360 מעלות סביב גוש גרניט בסדנת האבן"
            className="size-full object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-stone-deep/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-deep/55 via-transparent to-stone-deep/10" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-background">
          <p className="animate-stone-in eyebrow text-background/70">GALINOS</p>
          <h1 className="animate-stone-in display-1 mt-6 max-w-4xl text-background">
            {pick(t, "hero_title", "מצבות באבן ובשיש")}
          </h1>
          <p className="animate-stone-in mt-6 max-w-xl text-base leading-relaxed text-background/85 sm:text-lg">
            {pick(t, "hero_subtitle", "עיצוב, ייצור והתקנה בהתאמה אישית")}
          </p>
          <div className="animate-stone-in mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/gallery"
              className="rounded-sm bg-background px-8 py-3.5 text-sm tracking-wide text-foreground transition-colors duration-500 hover:bg-background/90"
            >
              {pick(t, "hero_cta_primary", "צפו בעבודות שלנו")}
            </Link>
            <Link
              to="/contact"
              className="rounded-sm border border-background/50 px-8 py-3.5 text-sm tracking-wide text-background transition-colors duration-500 hover:bg-background/10"
            >
              {pick(t, "hero_cta_secondary", "צרו קשר")}
            </Link>
          </div>

          <a
            href="#intro"
            className="absolute bottom-10 flex flex-col items-center gap-2 text-[11px] tracking-[0.22em] text-background/70 transition-colors hover:text-background"
          >
            {pick(t, "hero_scroll", "גלו עוד")}
            <ArrowDown className="size-4 animate-bounce" strokeWidth={1.2} />
          </a>
        </div>
      </section>

      {/* INTRO */}
      <section id="intro" className="container-page py-24 md:py-36">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="eyebrow">אודות</p>
            <h2 className="display-2 mt-5 max-w-md">{pick(t, "intro_title", "עבודה שנעשית מתוך כבוד")}</h2>
            <p className="mt-7 max-w-lg text-base leading-loose text-muted-foreground">{pick(t, "intro_text")}</p>
            <Link to="/about" className="mt-9 inline-block border-b border-foreground pb-1 text-sm tracking-wide">
              עוד על גלינוס
            </Link>
          </Reveal>
          <Reveal delay={1}>
            <Parallax className="aspect-[4/5] w-full" strength={0.1}>
              <img
                src={workshop}
                alt="סדנת אבן ושיש עם לוחות אבן"
                loading="lazy"
                width={1808}
                height={1200}
                className="size-full object-cover"
              />
            </Parallax>
          </Reveal>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-border bg-secondary/40 py-24 md:py-32">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">קטלוג</p>
            <h2 className="display-2 mt-5">{pick(t, "categories_title", "סוגי המצבות")}</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{pick(t, "categories_subtitle")}</p>
          </Reveal>

          <div className="mt-16 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {(categories ?? []).map((category, i) => (
              <Reveal key={category.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <Link
                  to="/monuments"
                  search={{ category: category.slug }}
                  className="group flex h-full flex-col justify-between bg-background p-8 transition-colors duration-500 hover:bg-card"
                >
                  <div className="mb-10 aspect-[3/2] overflow-hidden bg-secondary">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[11px] tracking-[0.2em] text-muted-foreground">
                        תמונה תתווסף מהניהול
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl">{category.name}</h3>
                    {category.description ? (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
                    ) : null}
                    <span className="mt-6 inline-block text-xs tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
                      לצפייה
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WORKS */}
      {works.length > 0 ? (
        <section className="container-page py-24 md:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">גלריה</p>
              <h2 className="display-2 mt-5">{pick(t, "gallery_title", "העבודות שלנו")}</h2>
            </div>
            <Link to="/gallery" className="border-b border-foreground pb-1 text-sm tracking-wide">
              לכל העבודות
            </Link>
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work, i) => (
              <Reveal key={`${work.image}-${i}`} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={work.image}
                    alt={work.label || "עבודת אבן של GALINOS"}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-[900ms] hover:scale-[1.03]"
                  />
                </div>
                {work.label ? <p className="mt-3 text-sm text-muted-foreground">{work.label}</p> : null}
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* PROCESS */}
      <section className="relative overflow-hidden border-y border-border bg-stone-deep py-24 text-background md:py-32">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-background/50">תהליך</p>
            <h2 className="display-2 mt-5 text-background">{pick(t, "process_title", "תהליך העבודה")}</h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-4 md:gap-8">
            {(steps ?? []).map((step, i) => (
              <Reveal key={step.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <p className="font-serif text-5xl text-background/25">{step.step_number}</p>
                <h3 className="mt-5 font-serif text-2xl text-background">{step.title}</h3>
                {step.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-background/70">{step.description}</p>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MATERIALS */}
      <section className="container-page py-24 md:py-32">
        <Reveal>
          <p className="eyebrow">חומרים</p>
          <h2 className="display-2 mt-5">{pick(t, "materials_title", "החומרים")}</h2>
        </Reveal>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {(materials ?? []).map((material, i) => (
            <Reveal key={material.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <Parallax className="aspect-[3/4] w-full bg-secondary" strength={0.08}>
                {material.image_url ? (
                  <img
                    src={material.image_url}
                    alt={material.title}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <img
                    src={i === 1 ? engraving : workshop}
                    alt={material.title}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                )}
              </Parallax>
              <h3 className="mt-6 font-serif text-2xl">{material.title}</h3>
              {material.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{material.description}</p>
              ) : null}
              {material.features ? (
                <p className="mt-4 text-xs leading-relaxed tracking-wide text-muted-foreground">{material.features}</p>
              ) : null}
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="border-y border-border bg-secondary/40 py-24 md:py-32">
        <div className="container-page">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">שירותים</p>
              <h2 className="display-2 mt-5">{pick(t, "services_title", "השירותים שלנו")}</h2>
            </div>
            <Link to="/services" className="border-b border-foreground pb-1 text-sm tracking-wide">
              לכל השירותים
            </Link>
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {(services ?? []).slice(0, 6).map((service, i) => (
              <Reveal key={service.id} delay={((i % 3) + 1) as 1 | 2 | 3} className="border-t border-border pt-6">
                <h3 className="font-serif text-xl">{service.title}</h3>
                {service.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      {(suppliers ?? []).length > 0 ? (
        <section className="border-y border-border bg-secondary/40 py-24 md:py-32">
          <div className="container-page">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">ספקים ושותפים</p>
                <h2 className="display-2 mt-5">{pick(t, "suppliers_title", "מחצבות, ספקי אבן ומתקינים")}</h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                  {pick(
                    t,
                    "suppliers_subtitle",
                    "אנו עובדים עם מחצבות, יבואני אבן וצוותי התקנה מוסמכים — כדי שכל שלב, מהגוש ועד ההצבה, יהיה באיכות אחת.",
                  )}
                </p>
              </div>
              <Link to="/suppliers" className="border-b border-foreground pb-1 text-sm tracking-wide">
                לכל הספקים והשותפים
              </Link>
            </Reveal>

            <div className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {(suppliers ?? []).slice(0, 3).map((supplier, i) => (
                <Reveal key={supplier.id} delay={((i % 3) + 1) as 1 | 2 | 3} className="bg-background p-8">
                  <div className="mb-8 aspect-[3/2] overflow-hidden bg-secondary">
                    {supplier.image_url || supplier.project_images[0] ? (
                      <img
                        src={supplier.image_url ?? supplier.project_images[0]}
                        alt={`פרויקט בשיתוף ${supplier.name}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />
                    ) : (
                      <img src={workshop} alt={supplier.name} loading="lazy" className="size-full object-cover" />
                    )}
                  </div>
                  {supplier.category_label ? <p className="eyebrow">{supplier.category_label}</p> : null}
                  <h3 className="mt-3 font-serif text-2xl">{supplier.name}</h3>
                  {supplier.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{supplier.description}</p>
                  ) : null}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* GUIDES / SEO LANDING PAGES */}
      {(landingPages ?? []).length > 0 ? (
        <section className="container-page py-24 md:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">מדריכים</p>
              <h2 className="display-2 mt-5">מדריכים לפי סוג מצבה וחומר</h2>
            </div>
            <Link to="/guides" className="border-b border-foreground pb-1 text-sm tracking-wide">
              לכל המדריכים
            </Link>
          </Reveal>
          <ul className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {(landingPages ?? []).slice(0, 6).map((page, i) => (
              <Reveal key={page.id} as="li" delay={((i % 3) + 1) as 1 | 2 | 3} className="border-t border-border pt-6">
                <Link
                  to={page.kind === "category" ? "/category/$slug" : "/material/$slug"}
                  params={{ slug: page.slug }}
                  className="group"
                >
                  <h3 className="font-serif text-xl group-hover:underline">{page.title}</h3>
                  {page.subtitle ? <p className="mt-2 text-sm text-muted-foreground">{page.subtitle}</p> : null}
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {trustItems.length > 0 ? (
        <section className="container-page py-24 md:py-32">
          <Reveal>
            <h2 className="display-2 max-w-xl">{pick(t, "trust_title", "למה לבחור ב-GALINOS?")}</h2>
          </Reveal>
          <ul className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item, i) => (
              <Reveal key={item} delay={((i % 3) + 1) as 1 | 2 | 3} as="li" className="bg-background p-8">
                <span className="font-serif text-xl">{item}</span>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {/* CTA */}
      <section className="relative overflow-hidden">
        <Parallax className="absolute inset-0" strength={0.14}>
          <img src={engraving} alt="פרט חריטה באבן" loading="lazy" className="size-full object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-stone-deep/70" />
        <div className="container-page relative z-10 flex flex-col items-center py-28 text-center text-background">
          <Reveal>
            <h2 className="display-2 max-w-2xl text-background">{pick(t, "contact_title", "צרו קשר")}</h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-background/80">
              {pick(t, "contact_subtitle")}
            </p>
            <Link
              to="/contact"
              className="mt-10 inline-block rounded-sm bg-background px-9 py-3.5 text-sm tracking-wide text-foreground"
            >
              לפנייה אישית
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
