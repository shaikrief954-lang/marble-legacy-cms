import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import workshop from "@/assets/workshop.jpg";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { Parallax } from "@/components/site/Parallax";
import { RouteError } from "@/components/site/RouteStates";
import { pageQuery, processQuery, siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      context.queryClient.ensureQueryData(pageQuery("about")),
      context.queryClient.ensureQueryData(processQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "אודות GALINOS — מצבות אבן ושיש" },
      {
        name: "description",
        content: "גלינוס מצבות ואבן: תכנון, ייצור והתקנה של מצבות באבן, בשיש ובגרניט, בליווי אישי ומכבד למשפחות.",
      },
      { property: "og:title", content: "אודות GALINOS" },
      { property: "og:description", content: "תכנון, ייצור והתקנה של מצבות באבן, בשיש ובגרניט." },
    ],
  }),
  errorComponent: RouteError,
  component: About,
});

function About() {
  const { data: page } = useQuery(pageQuery("about"));
  const { data: steps } = useQuery(processQuery);

  return (
    <SiteLayout>
      <PageHeader eyebrow="אודות" title={page?.title ?? "אודות GALINOS"}>
        <Breadcrumbs items={[{ label: "אודות" }]} />
      </PageHeader>

      <section className="container-page py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-[1fr_0.9fr] md:gap-20">
          <Reveal className="max-w-2xl space-y-6 text-base leading-loose text-muted-foreground">
            {(page?.content ?? "").split("\n").map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
            )}
          </Reveal>
          <Reveal delay={1}>
            <Parallax className="aspect-[4/5] w-full bg-secondary" strength={0.1}>
              <img
                src={page?.image_url || workshop}
                alt="סדנת האבן של גלינוס"
                loading="lazy"
                className="size-full object-cover"
              />
            </Parallax>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 py-20 md:py-28">
        <div className="container-page">
          <Reveal>
            <h2 className="display-2">תהליך העבודה</h2>
          </Reveal>
          <div className="mt-14 grid gap-12 md:grid-cols-4 md:gap-8">
            {(steps ?? []).map((step, i) => (
              <Reveal key={step.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <p className="font-serif text-5xl text-muted-foreground/40">{step.step_number}</p>
                <h3 className="mt-5 font-serif text-xl">{step.title}</h3>
                {step.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
