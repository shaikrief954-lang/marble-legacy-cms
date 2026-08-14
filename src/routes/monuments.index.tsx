import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { RouteError } from "@/components/site/RouteStates";
import { categoriesQuery, productsQuery, siteContentQuery } from "@/lib/queries";
import { formatPrice, pick } from "@/lib/site";

type Search = { category?: string };

export const Route = createFileRoute("/monuments/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search.category === "string" && search.category ? search.category : undefined,
  }),
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery(deps.category)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "קטלוג מצבות — שיש, גרניט, חברון | GALINOS" },
      {
        name: "description",
        content:
          "קטלוג המצבות של גלינוס: מצבות שיש טורקי, גרניט, אבן חברון, מצבות כפולות, משפחתיות ומעוצבות — בהתאמה אישית מלאה.",
      },
      { property: "og:title", content: "קטלוג מצבות — GALINOS" },
      { property: "og:description", content: "מצבות שיש, גרניט ואבן חברון בהתאמה אישית." },
    ],
  }),
  errorComponent: RouteError,
  component: MonumentsIndex,
});

function MonumentsIndex() {
  const { category } = Route.useSearch();
  const { data: content } = useQuery(siteContentQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: products } = useQuery(productsQuery(category));
  const t = content?.texts;
  const active = (categories ?? []).find((c) => c.slug === category);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="קטלוג"
        title={active?.name ?? pick(t, "categories_title", "סוגי המצבות")}
        description={active?.description ?? pick(t, "categories_subtitle")}
      >
        <Breadcrumbs items={[{ label: "מצבות", to: "/monuments" }, ...(active ? [{ label: active.name }] : [])]} />
      </PageHeader>

      <section className="container-page pb-24 pt-12 md:pb-32">
        <div className="flex flex-wrap gap-2 border-b border-border pb-8">
          <Link
            to="/monuments"
            search={{}}
            className={`rounded-sm border px-4 py-2 text-xs tracking-wide transition-colors ${
              !category ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
            }`}
          >
            הכל
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/monuments"
              search={{ category: c.slug }}
              className={`rounded-sm border px-4 py-2 text-xs tracking-wide transition-colors ${
                category === c.slug ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {(products ?? []).length === 0 ? (
          <p className="py-24 text-center text-sm text-muted-foreground">
            המצבות בקטגוריה זו יתווספו בקרוב. נשמח לשלוח לכם דוגמאות — צרו קשר.
          </p>
        ) : (
          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {(products ?? []).map((p, i) => (
              <Reveal key={p.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <Link to="/monuments/$slug" params={{ slug: p.slug }} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-secondary">
                    {p.main_image_url ? (
                      <img
                        src={p.main_image_url}
                        alt={p.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[11px] tracking-[0.2em] text-muted-foreground">
                        GALINOS
                      </div>
                    )}
                  </div>
                  <h2 className="mt-5 font-serif text-xl">{p.title}</h2>
                  {p.short_description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.short_description}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formatPrice(p.price, p.show_price, p.price_on_request, pick(t, "price_on_request", "מחיר לפי פנייה"))}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
