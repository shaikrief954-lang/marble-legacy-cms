import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone } from "lucide-react";
import { siteContentQuery } from "@/lib/queries";
import { pick, telHref, whatsappHref } from "@/lib/site";

export function FloatingActions() {
  const { data } = useQuery(siteContentQuery);
  const settings = data?.settings;
  const phone = pick(settings, "phone");
  const whatsapp = pick(settings, "whatsapp");
  const waMessage = pick(settings, "whatsapp_message");
  if (!whatsapp && !phone) return null;

  return (
    <>
      {/* desktop / tablet */}
      {whatsapp ? (
        <a
          href={whatsappHref(whatsapp, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="שליחת הודעה בוואטסאפ"
          className="fixed bottom-6 left-6 z-40 hidden size-12 items-center justify-center rounded-full bg-stone-deep text-background shadow-[var(--shadow-soft)] transition-transform duration-500 hover:scale-105 sm:flex"
        >
          <MessageCircle className="size-5" strokeWidth={1.4} />
        </a>
      ) : null}

      {/* mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur-xl sm:hidden">
        {phone ? (
          <a
            href={telHref(phone)}
            className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm tracking-wide"
          >
            <Phone className="size-4" strokeWidth={1.4} /> התקשרו
          </a>
        ) : null}
        {whatsapp ? (
          <a
            href={whatsappHref(whatsapp, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 border-r border-border bg-stone-deep py-3.5 text-sm tracking-wide text-background"
          >
            <MessageCircle className="size-4" strokeWidth={1.4} /> וואטסאפ
          </a>
        ) : null}
      </div>
    </>
  );
}
