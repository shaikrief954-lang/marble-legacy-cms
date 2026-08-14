import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RouteError } from "@/components/site/RouteStates";
import { pageQuery } from "@/lib/queries";

export const Route = createFileRoute("/privacy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageQuery("privacy")),
  head: () => ({
    meta: [
      { title: "מדיניות פרטיות — GALINOS" },
      { name: "description", content: "מדיניות הפרטיות של אתר GALINOS מצבות ואבן." },
      { property: "og:title", content: "מדיניות פרטיות — GALINOS" },
      { property: "og:description", content: "מדיניות הפרטיות של אתר GALINOS מצבות ואבן." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: RouteError,
  component: LegalPage,
});

function LegalPage() {
  const { data: page } = useQuery(pageQuery("privacy"));
  return (
    <SiteLayout>
      <PageHeader title={page?.title ?? "מדיניות פרטיות"}>
        <Breadcrumbs items={[{ label: "מדיניות פרטיות" }]} />
      </PageHeader>
      <section className="container-page max-w-3xl space-y-6 py-20 text-base leading-loose text-muted-foreground">
        {(page?.content ?? "").split("\n").map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null))}
      </section>
    </SiteLayout>
  );
}
