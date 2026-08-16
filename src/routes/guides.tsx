import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { RouteError } from "@/components/site/RouteStates";
import { landingPagesQuery, type LandingPage } from "@/lib/queries";

const TITLE = "מדריכי מצבות וחומרים — סוגי מצבות, שיש, גרניט ואבן | GALINOS";
const DESCRIPTION =
  "מדריכים לפי סוג מצבה ולפי חומר: מצבות גרניט, מצבות משפחתיות, שיש טורקי ואבן חברון — מאפיינים, יתרונות ותהליך העבודה.";

export const Route = createFileRoute("/guides")({
  loader: ({ context }) => context.queryClient.ensureQueryData(landingPagesQuery()),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://marble-legacy-cms.lovable.app/guides" },
    ],
    links: [{ rel: "canonical", href: "https://marble-legacy-cms.lovable.app/guides" }],
  }),
  errorComponent: RouteError,
  component: GuidesPage,
});

function Group({ pages, kind, title }: { pages: LandingPage[]; kind: "category" | "material"; title: string }) {
  const items = pages.filter((page) => page.kind === kind);
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="display-2">{title}</h2>
      <ul className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {items.map((page, i) => (
          <Reveal key={page.id} as="li" delay={((i % 3) + 1) as 1 | 2 | 3} className="bg-background">
            <Link
              to={kind === "category" ? "/category/$slug" : "/material/$slug"}
              params={{ slug: page.slug }}
              className="group flex h-full flex-col p-8 transition-colors duration-500 hover:bg-card"
            >
              {page.hero_image_url ? (
                <div className="mb-8 aspect-[3/2] overflow-hidden bg-secondary">
                  <img
                    src={page.hero_image_url}
                    alt={page.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              ) : null}
              <h3 className="font-serif text-2xl">{page.title}</h3>
              {page.subtitle ? <p className="mt-2 text-xs tracking-wide text-muted-foreground">{page.subtitle}</p> : null}
              {page.intro ? (
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{page.intro}</p>
              ) : null}
              <span className="mt-6 text-xs tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
                למדריך המלא
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

function GuidesPage() {
  const { data: pages } = useQuery(landingPagesQuery());

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="מדריכים"
        title="מדריכי מצבות וחומרים"
        description="עמוד לכל סוג מצבה ולכל חומר — כדי שתוכלו להשוות, להבין את ההבדלים ולבחור נכון."
      >
        <Breadcrumbs items={[{ label: "מדריכים" }]} />
      </PageHeader>

      <section className="container-page space-y-20 py-20">
        <Group pages={pages ?? []} kind="category" title="לפי סוג מצבה" />
        <Group pages={pages ?? []} kind="material" title="לפי חומר" />
      </section>
    </SiteLayout>
  );
}