import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { RouteError } from "@/components/site/RouteStates";
import { servicesQuery, siteContentQuery } from "@/lib/queries";
import { pick } from "@/lib/site";

export const Route = createFileRoute("/services")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      context.queryClient.ensureQueryData(servicesQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "השירותים שלנו — GALINOS מצבות ואבן" },
      {
        name: "description",
        content: "ייצור מצבות, עיצוב בהתאמה אישית, חריטה, שיפוץ וחידוש מצבות, תחזוקה והתקנה מקצועית.",
      },
      { property: "og:title", content: "השירותים שלנו — GALINOS" },
      { property: "og:description", content: "ייצור, עיצוב, חריטה, שיפוץ, תחזוקה והתקנה של מצבות." },
    ],
  }),
  errorComponent: RouteError,
  component: Services,
});

function Services() {
  const { data: content } = useQuery(siteContentQuery);
  const { data: services } = useQuery(servicesQuery);
  const t = content?.texts;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="שירותים"
        title={pick(t, "services_title", "השירותים שלנו")}
        description={pick(t, "services_subtitle")}
      >
        <Breadcrumbs items={[{ label: "שירותים" }]} />
      </PageHeader>

      <section className="container-page py-20 md:py-28">
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {(services ?? []).map((service, i) => (
            <Reveal key={service.id} delay={((i % 2) + 1) as 1 | 2} className="bg-background p-8 md:p-12">
              {service.image_url ? (
                <div className="mb-8 aspect-[3/2] overflow-hidden bg-secondary">
                  <img src={service.image_url} alt={service.title} loading="lazy" className="size-full object-cover" />
                </div>
              ) : null}
              <h2 className="font-serif text-2xl">{service.title}</h2>
              {service.description ? (
                <p className="mt-4 max-w-lg text-sm leading-loose text-muted-foreground">{service.description}</p>
              ) : null}
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 text-center">
          <Link to="/contact" className="inline-block rounded-sm bg-primary px-9 py-3.5 text-sm text-primary-foreground">
            לפנייה אישית
          </Link>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
