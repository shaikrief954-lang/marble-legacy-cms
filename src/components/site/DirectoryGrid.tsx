import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import { Reveal } from "./Reveal";
import type { DirectoryEntry } from "@/lib/queries";

export function DirectoryGrid({ entries }: { entries: DirectoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        הרשימה תתעדכן בקרוב דרך ממשק הניהול.
      </p>
    );
  }

  return (
    <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, i) => (
        <Reveal key={entry.id} as="li" delay={((i % 3) + 1) as 1 | 2 | 3} className="flex flex-col bg-background p-8">
          {entry.logo_url ? (
            <img
              src={entry.logo_url}
              alt={entry.name}
              loading="lazy"
              className="mb-6 h-12 w-auto object-contain"
            />
          ) : null}
          {entry.category_label ? <p className="eyebrow">{entry.category_label}</p> : null}
          <h2 className="mt-3 font-serif text-2xl">{entry.name}</h2>
          {entry.role_label ? <p className="mt-1 text-xs tracking-wide text-muted-foreground">{entry.role_label}</p> : null}
          {entry.description ? (
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
          ) : <span className="flex-1" />}

          <div className="mt-6 space-y-2 text-sm">
            {entry.city || entry.address ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" strokeWidth={1.4} />
                {[entry.address, entry.city].filter(Boolean).join(", ")}
              </p>
            ) : null}
            {entry.phone ? (
              <a href={`tel:${entry.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Phone className="size-3.5 shrink-0" strokeWidth={1.4} />
                {entry.phone}
              </a>
            ) : null}
            {entry.email ? (
              <a href={`mailto:${entry.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Mail className="size-3.5 shrink-0" strokeWidth={1.4} />
                {entry.email}
              </a>
            ) : null}
            {entry.website_url ? (
              <a
                href={entry.website_url}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 border-b border-foreground pb-0.5 text-xs tracking-wide"
              >
                <ExternalLink className="size-3.5" strokeWidth={1.4} />
                לאתר הארגון
              </a>
            ) : null}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}