import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LandingPageView } from "@/components/site/LandingPageView";
import { RouteError, RouteNotFound } from "@/components/site/RouteStates";
import { landingPageQuery } from "@/lib/queries";

const BASE = "https://marble-legacy-cms.lovable.app";

export const Route = createFileRoute("/material/$slug")({
  loader: async ({ context, params }) => {
    const page = await context.queryClient.ensureQueryData(landingPageQuery("material", params.slug));
    if (!page) throw notFound();
    return { page };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "העמוד לא נמצא — GALINOS" }, { name: "robots", content: "noindex" }] };
    }
    const { page } = loaderData;
    const title = page.seo_title ?? `${page.title} — GALINOS`;
    const description = page.seo_description ?? page.intro ?? page.subtitle ?? "";
    const url = `${BASE}/material/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.title,
            description,
            author: { "@type": "Organization", name: "GALINOS" },
          }),
        },
      ],
    };
  },
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
  component: MaterialLanding,
});

function MaterialLanding() {
  const { slug } = Route.useParams();
  const { data: page } = useQuery(landingPageQuery("material", slug));
  if (!page) return <RouteNotFound />;
  return <LandingPageView page={page} crumbLabel="חומרים" />;
}