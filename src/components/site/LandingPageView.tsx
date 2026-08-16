import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout, PageHeader } from "./SiteLayout";
import { Breadcrumbs } from "./Breadcrumbs";
import { Reveal } from "./Reveal";
import type { LandingPage } from "@/lib/queries";

export function LandingPageView({ page, crumbLabel }: { page: LandingPage; crumbLabel: string }) {
  return (
    <SiteLayout>
      <PageHeader eyebrow={page.subtitle ?? undefined} title={page.title} description={page.intro}>
        <Breadcrumbs items={[{ label: crumbLabel, to: "/guides" }, { label: page.title }]} />
      </PageHeader>

      {page.hero_image_url ? (
        <div className="container-page -mt-8">
          <div className="aspect-[16/7] overflow-hidden bg-secondary">
            <img src={page.hero_image_url} alt={page.title} className="size-full object-cover" />
          </div>
        </div>
      ) : null}

      <section className="container-page grid gap-14 py-20 md:grid-cols-[1fr_minmax(0,20rem)]">
        <Reveal>
          {page.body
            ? page.body.split("\n").filter(Boolean).map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mb-5 text-base leading-loose text-muted-foreground">
                  {paragraph}
                </p>
              ))
            : null}

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/monuments"
              className="rounded-sm bg-primary px-7 py-3 text-sm tracking-wide text-primary-foreground"
            >
              לקטלוג המצבות
            </Link>
            <Link to="/contact" className="rounded-sm border border-input px-7 py-3 text-sm tracking-wide">
              לקבלת הצעת מחיר
            </Link>
          </div>
        </Reveal>

        {page.bullets.length > 0 ? (
          <Reveal delay={1} as="aside" className="border-t border-border pt-6 md:border-t-0 md:border-s md:ps-8 md:pt-0">
            <p className="eyebrow">עיקרי הדברים</p>
            <ul className="mt-6 space-y-4">
              {page.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-sm leading-relaxed">
                  <Check className="mt-0.5 size-4 shrink-0 text-brass" strokeWidth={1.5} />
                  {bullet}
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </section>

      {page.gallery_images.length > 0 ? (
        <section className="container-page pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.gallery_images.map((image) => (
              <div key={image} className="aspect-[4/5] overflow-hidden bg-secondary">
                <img
                  src={image}
                  alt={page.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-[900ms] hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}