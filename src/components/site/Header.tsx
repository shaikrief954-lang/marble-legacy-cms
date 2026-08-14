import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, pick, telHref, whatsappHref } from "@/lib/site";
import { siteContentQuery } from "@/lib/queries";

const LANGS = [
  { code: "he", label: "HE", enabled: true },
  { code: "fr", label: "FR", enabled: false },
  { code: "en", label: "EN", enabled: false },
];

export function Header({ overlay = false }: { overlay?: boolean }) {
  const { data } = useQuery(siteContentQuery);
  const settings = data?.settings;
  const phone = pick(settings, "phone");
  const whatsapp = pick(settings, "whatsapp");
  const waMessage = pick(settings, "whatsapp_message");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || !overlay;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700",
        solid
          ? "border-b border-border/70 bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link
          to="/"
          className={cn(
            "font-serif text-2xl tracking-[0.18em] transition-colors",
            solid ? "text-foreground" : "text-background",
          )}
          aria-label="GALINOS — עמוד הבית"
        >
          GALINOS
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="ניווט ראשי">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative py-1 text-sm transition-opacity after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100",
                solid ? "text-foreground/80 hover:text-foreground" : "text-background/85 hover:text-background",
              )}
              activeProps={{ className: "after:scale-x-100" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "hidden items-center gap-1 text-[11px] tracking-[0.18em] md:flex",
              solid ? "text-muted-foreground" : "text-background/70",
            )}
          >
            {LANGS.map((lang) => (
              <span key={lang.code}>
                <button
                  type="button"
                  disabled={!lang.enabled}
                  aria-current={lang.enabled ? "true" : undefined}
                  title={lang.enabled ? "עברית" : "בקרוב"}
                  className={cn(
                    "px-1 transition-colors",
                    lang.enabled ? "text-current underline decoration-1 underline-offset-4" : "opacity-40",
                  )}
                >
                  {lang.label}
                </button>
              </span>
            ))}
          </div>

          {phone ? (
            <a
              href={telHref(phone)}
              aria-label={`התקשרו ${phone}`}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border transition-colors",
                solid
                  ? "border-border text-foreground hover:bg-secondary"
                  : "border-background/40 text-background hover:bg-background/10",
              )}
            >
              <Phone className="size-4" strokeWidth={1.4} />
            </a>
          ) : null}

          {whatsapp ? (
            <a
              href={whatsappHref(whatsapp, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="שליחת הודעה בוואטסאפ"
              className={cn(
                "hidden size-9 items-center justify-center rounded-full border transition-colors sm:flex",
                solid
                  ? "border-border text-foreground hover:bg-secondary"
                  : "border-background/40 text-background hover:bg-background/10",
              )}
            >
              <MessageCircle className="size-4" strokeWidth={1.4} />
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="פתיחת תפריט"
            className={cn(
              "flex size-9 items-center justify-center rounded-full border transition-colors lg:hidden",
              solid
                ? "border-border text-foreground hover:bg-secondary"
                : "border-background/40 text-background hover:bg-background/10",
            )}
          >
            <Menu className="size-4" strokeWidth={1.4} />
          </button>
        </div>
      </div>

      {/* full-screen mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-stone-deep text-background transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="container-page flex h-[72px] items-center justify-between">
          <span className="font-serif text-2xl tracking-[0.18em]">GALINOS</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="סגירת תפריט"
            className="flex size-9 items-center justify-center rounded-full border border-background/40"
          >
            <X className="size-4" strokeWidth={1.4} />
          </button>
        </div>
        <nav className="container-page flex flex-1 flex-col justify-center gap-1" aria-label="ניווט מובייל">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "border-b border-background/10 py-4 font-serif text-3xl transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: open ? `${80 + i * 55}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="container-page flex flex-col gap-3 pb-10 text-sm">
          {phone ? (
            <a href={telHref(phone)} className="flex items-center gap-3 text-background/85">
              <Phone className="size-4" strokeWidth={1.4} /> {phone}
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsappHref(whatsapp, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-background/85"
            >
              <MessageCircle className="size-4" strokeWidth={1.4} /> וואטסאפ
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
