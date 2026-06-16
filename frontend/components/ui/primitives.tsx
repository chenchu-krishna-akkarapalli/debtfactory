import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const GAP = { 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6", 8: "gap-8" } as const;
type Gap = keyof typeof GAP;

/** Vertical flow with a gap. */
export function Stack({
  gap = 4,
  className,
  children,
}: {
  gap?: Gap;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("flex flex-col", GAP[gap], className)}>{children}</div>;
}

/** Horizontal, wrapping row with a gap. */
export function Cluster({
  gap = 2,
  justify = "start",
  align = "center",
  wrap = true,
  className,
  children,
}: {
  gap?: Gap;
  justify?: "start" | "between" | "end";
  align?: "center" | "baseline" | "start";
  wrap?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex",
        wrap && "flex-wrap",
        GAP[gap],
        { start: "justify-start", between: "justify-between", end: "justify-end" }[justify],
        { center: "items-center", baseline: "items-baseline", start: "items-start" }[align],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Responsive auto-fit grid. */
export function Grid({
  min = "12rem",
  gap = 3,
  className,
  children,
}: {
  min?: string;
  gap?: Gap;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("grid", GAP[gap], className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}, 100%), 1fr))` }}
    >
      {children}
    </div>
  );
}

/** Surface card. */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-4", className)}>{children}</div>
  );
}

/** Uppercase mono section label. */
export function SectionLabel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn("label-mono", className)}>{children}</span>;
}
