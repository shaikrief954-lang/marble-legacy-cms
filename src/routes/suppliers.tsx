import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { RouteError } from "@/components/site/RouteStates";
import { directoryQuery } from "@/lib/queries";

const TITLE = "ספקי אבן, מחצבות ומתקינים שותפים | GALINOS";
const DESCRIPTION =
  "המחצבות, ספקי השיש והגרניט וצוותי ההתקנה שאנו עובדים איתם — כולל תמונות פרויקטים משותפים, אזורי פעילות ותחומי התמחות.";

export const Route = createFileRoute("/suppliers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(directoryQuery("supplier")),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://marble-legacy-cms.lovable.app/suppliers" },
    ],
    links: [{ rel: "canonical", href: "https://marble-legacy-cms.lovable.app/suppliers" }],
  }),
  errorComponent: RouteError,
  component: SuppliersPage,
});

function SuppliersPage() {
  const { data: suppliers } = useQuery(directoryQuery("supplier"));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="ספקים ושותפים"
        title="מחצבות, ספקי אבן ומתקינים"
        description="שרשרת האספקה שמאחורי כל מצבה: מחצבות ויבואני אבן, ספקי גרניט ושיש וצוותי התקנה מוסמכים."
      >
        <Breadcrumbs items={[{ label: "ספקים ומתקינים" }]} />
      </PageHeader>

      <section className="container-page space-y-20 py-20">
        {(suppliers ?? []).length === 0 ? (
          <p className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            הרשימה תתעדכן בקרוב דרך ממשק הניהול.
          </p>
        ) : null}

        {(suppliers ?? []).map((supplier, index) => (
          <Reveal key={supplier.id} className="border-t border-border pt-10">
            <div className="grid gap-10 md:grid-cols-[minmax(0,22rem)_1fr]">
              <div>
                {supplier.category_label ? <p className="eyebrow">{supplier.category_label}</p> : null}
                <h2 className="display-2 mt-4">{supplier.name}</h2>
                {supplier.role_label ? (
                  <p className="mt-2 text-xs tracking-[0.18em] text-muted-foreground">{supplier.role_label}</p>
                ) : null}
                {supplier.description ? (
                  <p className="mt-5 text-sm leading-loose text-muted-foreground">{supplier.description}</p>
                ) : null}
                <dl className="mt-6 space-y-1 text-sm text-muted-foreground">
                  {supplier.city ? (
                    <div className="flex gap-2">
                      <dt>אזור פעילות:</dt>
                      <dd className="text-foreground">{supplier.city}</dd>
                    </div>
                  ) : null}
                  {supplier.phone ? (
                    <div className="flex gap-2">
                      <dt>טלפון:</dt>
                      <dd>
                        <a href={`tel:${supplier.phone}`} className="text-foreground">
                          {supplier.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {supplier.website_url ? (
                  <a
                    href={supplier.website_url}
                    target="_blank"
                    rel="noopener"
                    className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm tracking-wide"
                  >
                    <ExternalLink className="size-3.5" strokeWidth={1.4} />
                    לאתר הספק
                  </a>
                ) : null}
              </div>

              <div>
                {supplier.image_url ? (
                  <div className="aspect-[16/9] overflow-hidden bg-secondary">
                    <img
                      src={supplier.image_url}
                      alt={`${supplier.name} — עבודה משותפת`}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="size-full object-cover transition-transform duration-[900ms] hover:scale-[1.02]"
                    />
                  </div>
                ) : null}
                {supplier.project_images.length > 0 ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {supplier.project_images.map((image) => (
                      <div key={image} className="aspect-[4/5] overflow-hidden bg-secondary">
                        <img
                          src={image}
                          alt={`פרויקט בשיתוף ${supplier.name}`}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-[900ms] hover:scale-[1.03]"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                {!supplier.image_url && supplier.project_images.length === 0 ? (
                  <div className="flex h-full min-h-40 items-center justify-center border border-dashed border-border text-xs tracking-[0.2em] text-muted-foreground">
                    תמונות פרויקטים יתווספו מהניהול
                  </div>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    </SiteLayout>
  );
}