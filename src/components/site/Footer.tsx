import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/queries";
import { NAV_ITEMS, RESOURCE_LINKS, pick, telHref, whatsappHref } from "@/lib/site";

export function Footer() {
  const { data } = useQuery(siteContentQuery);
  const settings = data?.settings;
  const company = pick(settings, "company_name", "GALINOS");
  const tagline = pick(settings, "tagline", "מצבות | אבן | שיש");
  const footerText = pick(settings, "footer_text");
  const phone = pick(settings, "phone");
  const whatsapp = pick(settings, "whatsapp");
  const waMessage = pick(settings, "whatsapp_message");
  const email = pick(settings, "email");
  const address = pick(settings, "address");
  const hours = pick(settings, "hours");

  return (
    <footer className="mt-32 border-t border-border bg-stone-deep text-background/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div>
          <p className="font-serif text-3xl tracking-[0.18em] text-background">{company}</p>
          <p className="mt-3 text-sm tracking-[0.14em] text-background/60">{tagline}</p>
          {footerText ? <p className="mt-6 max-w-sm text-sm leading-relaxed">{footerText}</p> : null}
        </div>

        <nav aria-label="ניווט תחתון">
          <p className="eyebrow text-background/50">ניווט</p>
          <ul className="mt-5 space-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-background">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="מדריכים וספקים">
          <p className="eyebrow text-background/50">מדריכים ושותפים</p>
          <ul className="mt-5 space-y-2 text-sm">
            {RESOURCE_LINKS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-background">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-background/50">יצירת קשר</p>
          <ul className="mt-5 space-y-2 text-sm">
            {phone ? (
              <li>
                <a href={telHref(phone)} className="transition-colors hover:text-background">
                  {phone}
                </a>
              </li>
            ) : null}
            {whatsapp ? (
              <li>
                <a
                  href={whatsappHref(whatsapp, waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-background"
                >
                  וואטסאפ
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="transition-colors hover:text-background">
                  {email}
                </a>
              </li>
            ) : null}
            {address ? <li>{address}</li> : null}
            {hours ? <li className="text-background/60">{hours}</li> : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-background/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-background">
              מדיניות פרטיות
            </Link>
            <Link to="/terms" className="transition-colors hover:text-background">
              תקנון ותנאי שימוש
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
