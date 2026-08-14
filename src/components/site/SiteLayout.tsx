import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingActions } from "./FloatingActions";

export function SiteLayout({ children, overlayHeader = false }: { children: ReactNode; overlayHeader?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header overlay={overlayHeader} />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer />
      <FloatingActions />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-secondary/40 pt-[132px] pb-16">
      <div className="container-page">
        {children}
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h1 className="display-2 max-w-3xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
