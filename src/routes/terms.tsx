import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RouteError } from "@/components/site/RouteStates";
import { pageQuery } from "@/lib/queries";

export const Route = createFileRoute("/terms")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageQuery("terms")),
  head: () => ({
    meta: [
      { title: "תקנון ותנאי שימוש — GALINOS" },
      { name: "description", content: "תנאי השימוש באתר GALINOS מצבות ואבן." },
      { property: "og:title", content: "תקנון ותנאי שימוש — GALINOS" },
      { property: "og:description", content: "תנאי השימוש באתר GALINOS מצבות ואבן." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: RouteError,
  component: LegalPage,
});

function LegalPage() {
  const { data: page } = useQuery(pageQuery("terms"));
  return (
    <SiteLayout>
      <PageHeader title={page?.title ?? "תקנון ותנאי שימוש"}>
        <Breadcrumbs items={[{ label: "תקנון ותנאי שימוש" }]} />
      </PageHeader>
      <section className="container-page max-w-3xl space-y-6 py-20 text-base leading-loose text-muted-foreground">
        {(page?.content ?? "").split("\n").map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null))}
      </section>
    </SiteLayout>
  );
}
