import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DirectoryGrid } from "@/components/site/DirectoryGrid";
import { RouteError } from "@/components/site/RouteStates";
import { directoryQuery } from "@/lib/queries";

const TITLE = "שותפים ובעלי מקצוע מומלצים — בתי עלמין ובתי לוויות | GALINOS";
const DESCRIPTION =
  "בתי עלמין, בתי לוויות וארגונים קהילתיים שאנו עובדים איתם בקביעות. רשימת שותפים מומלצים עם תחומי אחריות, אזור פעילות ופרטי התקשרות.";

export const Route = createFileRoute("/partners")({
  loader: ({ context }) => context.queryClient.ensureQueryData(directoryQuery("partner")),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://marble-legacy-cms.lovable.app/partners" },
    ],
    links: [{ rel: "canonical", href: "https://marble-legacy-cms.lovable.app/partners" }],
  }),
  errorComponent: RouteError,
  component: PartnersPage,
});

function PartnersPage() {
  const { data: entries } = useQuery(directoryQuery("partner"));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="שותפים"
        title="שותפים ובעלי מקצוע מומלצים"
        description="בתי עלמין, בתי לוויות וארגונים קהילתיים שאנו עובדים איתם — כדי שהמשפחה תקבל ליווי רציף מרגע הפטירה ועד הצבת המצבה."
      >
        <Breadcrumbs items={[{ label: "שותפים מומלצים" }]} />
      </PageHeader>

      <section className="container-page py-20">
        <DirectoryGrid entries={entries ?? []} />
      </section>
    </SiteLayout>
  );
}