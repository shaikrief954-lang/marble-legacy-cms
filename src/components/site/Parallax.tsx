import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Subtle vertical parallax driven by rAF-throttled scroll. */
export function Parallax({
  children,
  className,
  strength = 0.12,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outerEl = wrapper.current;
    const innerEl = inner.current;
    if (!outerEl || !innerEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = outerEl.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      innerEl.style.transform = `translate3d(0, ${(-progress * strength * 100).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <div ref={wrapper} className={cn("overflow-hidden", className)}>
      <div ref={inner} data-parallax className="h-[118%] w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
