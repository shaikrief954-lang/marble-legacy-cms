import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DirectoryGrid } from "@/components/site/DirectoryGrid";
import { RouteError } from "@/components/site/RouteStates";
import { directoryQuery } from "@/lib/queries";

const TITLE = "קהילה וארגונים — גופים דתיים ומקצועיים | GALINOS";
const DESCRIPTION =
  "ריכוז ארגונים דתיים, מקצועיים וקהילתיים הרלוונטיים להקמת מצבה: חברה קדישא, מועצות דתיות וארגוני אמני אבן, עם קישורים ותיאור פעילות.";

export const Route = createFileRoute("/community")({
  loader: ({ context }) => context.queryClient.ensureQueryData(directoryQuery("organization")),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://marble-legacy-cms.lovable.app/community" },
    ],
    links: [{ rel: "canonical", href: "https://marble-legacy-cms.lovable.app/community" }],
  }),
  errorComponent: RouteError,
  component: CommunityPage,
});

function CommunityPage() {
  const { data: entries } = useQuery(directoryQuery("organization"));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="קהילה"
        title="קהילה וארגונים"
        description="ארגונים דתיים, מקצועיים וקהילתיים שאנו עובדים איתם ושיכולים לסייע למשפחות בתהליך — כולל קישורים ופרטי התקשרות."
      >
        <Breadcrumbs items={[{ label: "קהילה וארגונים" }]} />
      </PageHeader>

      <section className="container-page py-20">
        <DirectoryGrid entries={entries ?? []} />
      </section>
    </SiteLayout>
  );
}