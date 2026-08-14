import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal } from "@/components/site/Reveal";
import { RouteError } from "@/components/site/RouteStates";
import { categoriesQuery, siteContentQuery } from "@/lib/queries";
import { pick, telHref, whatsappHref } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(2, "נא למלא שם מלא").max(100),
  phone: z.string().trim().min(7, "נא למלא מספר טלפון").max(30),
  email: z.union([z.literal(""), z.string().trim().email("כתובת אימייל לא תקינה").max(255)]),
  subject: z.string().trim().max(120),
  message: z.string().trim().min(5, "נא לכתוב הודעה קצרה").max(1500),
});

export const Route = createFileRoute("/contact")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "צרו קשר — GALINOS מצבות ואבן" },
      {
        name: "description",
        content: "השאירו פרטים ונחזור אליכם בהקדם: ייעוץ, הצעת מחיר והזמנת מצבה באבן, בשיש או בגרניט.",
      },
      { property: "og:title", content: "צרו קשר — GALINOS" },
      { property: "og:description", content: "ייעוץ אישי, הצעת מחיר והזמנת מצבה." },
    ],
  }),
  errorComponent: RouteError,
  component: Contact,
});

function Contact() {
  const { data: content } = useQuery(siteContentQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const t = content?.texts;
  const s = content?.settings;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = schema.safeParse({
      name: raw.name ?? "",
      phone: raw.phone ?? "",
      email: raw.email ?? "",
      subject: raw.subject ?? "",
      message: raw.message ?? "",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "נא לבדוק את הפרטים");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setSending(false);
    if (error) {
      toast.error("שליחת ההודעה נכשלה. נסו שוב או התקשרו אלינו.");
      return;
    }
    form.reset();
    setSent(true);
    toast.success(pick(t, "contact_success", "תודה! נחזור אליכם בהקדם."));
  }

  const field =
    "mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground";

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="צור קשר"
        title={pick(t, "contact_title", "צרו קשר")}
        description={pick(t, "contact_subtitle")}
      >
        <Breadcrumbs items={[{ label: "צור קשר" }]} />
      </PageHeader>

      <section className="container-page pb-24 pt-16 md:pb-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr] lg:gap-24">
          <Reveal>
            {sent ? (
              <div className="border border-border bg-secondary/50 p-10 text-center">
                <p className="font-serif text-2xl">{pick(t, "contact_success", "תודה! נחזור אליכם בהקדם.")}</p>
                <button type="button" onClick={() => setSent(false)} className="mt-6 border-b border-foreground pb-1 text-sm">
                  שליחת פנייה נוספת
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
                <label className="block text-sm">
                  שם מלא *
                  <input name="name" required maxLength={100} className={field} />
                </label>
                <label className="block text-sm">
                  טלפון *
                  <input name="phone" required inputMode="tel" maxLength={30} className={field} />
                </label>
                <label className="block text-sm">
                  אימייל
                  <input name="email" type="email" maxLength={255} className={field} />
                </label>
                <label className="block text-sm">
                  נושא הפנייה
                  <select name="subject" defaultValue="" className={field}>
                    <option value="">כללי</option>
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="שיפוץ מצבה">שיפוץ מצבה</option>
                    <option value="חריטה נוספת">חריטה נוספת</option>
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  הודעה *
                  <textarea name="message" required rows={6} maxLength={1500} className={field} />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-sm bg-primary px-8 py-3.5 text-sm text-primary-foreground transition-opacity disabled:opacity-60 sm:w-auto"
                  >
                    {sending ? "שולח..." : "שליחת פנייה"}
                  </button>
                </div>
              </form>
            )}
          </Reveal>

          <Reveal delay={1} className="space-y-8 text-sm">
            {pick(s, "phone") ? (
              <a href={telHref(pick(s, "phone"))} className="flex items-center gap-4 transition-colors hover:text-muted-foreground">
                <Phone className="size-4" strokeWidth={1.4} />
                <span dir="ltr">{pick(s, "phone")}</span>
              </a>
            ) : null}
            {pick(s, "whatsapp") ? (
              <a
                href={whatsappHref(pick(s, "whatsapp"), pick(s, "whatsapp_message"))}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-foreground pb-1"
              >
                שליחת הודעה בוואטסאפ
              </a>
            ) : null}
            {pick(s, "email") ? (
              <a href={`mailto:${pick(s, "email")}`} className="flex items-center gap-4 transition-colors hover:text-muted-foreground">
                <Mail className="size-4" strokeWidth={1.4} />
                <span dir="ltr">{pick(s, "email")}</span>
              </a>
            ) : null}
            {pick(s, "address") ? (
              <p className="flex items-center gap-4 text-muted-foreground">
                <MapPin className="size-4" strokeWidth={1.4} />
                {pick(s, "address")}
              </p>
            ) : null}
            {pick(s, "hours") ? <p className="text-muted-foreground">{pick(s, "hours")}</p> : null}
            <p className="border-t border-border pt-8 leading-loose text-muted-foreground">
              אנו מלווים משפחות בכל שלב — מבחירת האבן ועד ההתקנה בבית העלמין, בסבלנות ובכבוד.
            </p>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
