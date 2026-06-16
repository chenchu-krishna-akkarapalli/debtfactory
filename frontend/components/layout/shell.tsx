import { Activity, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { ThemeToggle } from "./ThemeToggle";

/** Max-width, centered, responsive horizontal padding. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1360px]", className)}>{children}</div>;
}

/** App header. */
export function Header() {
  return (
    <header className="z-10 shrink-0 border-b border-border bg-canvas/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent-soft text-accent">
            <SlidersHorizontal size={16} />
          </span>
          <span className="label-mono text-fg">Rule Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="label-mono inline-flex items-center gap-1.5 text-pass">
            <Activity size={13} /> live
          </span>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}

/**
 * Page frame. On lg+ the app is locked to the viewport height (no page scroll) —
 * each panel scrolls internally. On mobile it flows normally.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:h-dvh lg:overflow-hidden">
      <Header />
      <main className="flex-1 p-4 md:px-6 lg:min-h-0 lg:overflow-hidden">
        <Container className="lg:h-full">{children}</Container>
      </main>
    </div>
  );
}

/** Three-rail console: chips · applicant · rule match. Fills the viewport on lg+. */
export function ConsoleGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:h-full lg:grid-cols-[208px_minmax(0,1fr)_minmax(0,420px)]">
      {children}
    </div>
  );
}

/**
 * Titled surface region with an internal scroll area, a designed scrollbar, and a
 * bottom fade. Stretches to its grid cell so all rails share one height.
 */
export function Panel({
  title,
  icon,
  actions,
  className,
  children,
}: {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface",
        "max-lg:max-h-[78dvh]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-fg-muted">
          {icon}
          <span className="label-mono text-fg">{title}</span>
        </div>
        {actions}
      </div>
      <div className="relative min-h-0 flex-1">
        <div className="scroll-styled h-full overflow-y-auto p-4">{children}</div>
        {/* Bottom fade shade — hints at more content below. */}
        <div className="pointer-events-none absolute inset-x-px bottom-0 h-12 rounded-b-xl bg-gradient-to-t from-surface to-transparent" />
      </div>
    </section>
  );
}
