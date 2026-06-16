# Design System — Global Tokens & Box Layout

Scope: **global files** (`app/globals.css`, `app/layout.tsx`) and the **box layout
system** (`components/layout/*`, `components/ui/*`). This is the design architecture
the Rule Engine page composes from. Leaf visual polish is finalized by the **Stitch**
pass, which updates the token *values* here — never hard-codes new ones.

> **Golden rule:** components consume **tokens** (CSS vars → Tailwind utilities).
> A raw hex / px in a component is a bug. Tailwind v4 generates utilities from the
> `@theme` block, so `--color-accent` → `bg-accent`, `--radius-lg` → `rounded-lg`, etc.

---

## 1. Global file — `app/globals.css` (tokens)

Dark "console" theme, orange accent, monospace labels — derived from the mockup;
Stitch will tune the exact values.

```css
@import "tailwindcss";

@theme {
  /* ---- surfaces (back → front) ---- */
  --color-canvas:      #0a0a0b;   /* page background */
  --color-surface:     #151517;   /* panels / cards */
  --color-surface-2:   #1c1c20;   /* rows, inputs */
  --color-elevated:    #232328;   /* hover / selected */
  --color-border:      #2a2a30;   /* hairline borders */
  --color-border-soft: rgba(255,255,255,0.06);

  /* ---- text ---- */
  --color-fg:        #ededed;
  --color-fg-muted:  #9a9aa2;
  --color-fg-subtle: #6b6b73;

  /* ---- brand / accent (orange) ---- */
  --color-accent:      #ff6a1a;
  --color-accent-soft: rgba(255,106,26,0.14);

  /* ---- semantic status ---- */
  --color-pass:      #34d399;  --color-pass-soft: rgba(52,211,153,0.12);
  --color-fail:      #f4434f;  --color-fail-soft: rgba(244,67,79,0.12);
  --color-warn:      #f5b13d;

  /* ---- typography ---- */
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;

  /* ---- radii ---- */
  --radius-sm: 0.375rem; --radius-md: 0.625rem; --radius-lg: 0.875rem; --radius-pill: 9999px;

  /* spacing/sizing: Tailwind's default 4px scale */
}

@layer base {
  html { color-scheme: dark; }
  body {
    background: var(--color-canvas);
    color: var(--color-fg);
    font-family: var(--font-sans);
  }
  /* console label: uppercase, tracked, mono, muted, small */
  .label-mono {
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.75rem;
    color: var(--color-fg-muted);
  }
}
```

**Fonts** (in `app/layout.tsx`, `next/font`): `Geist` (sans) + a monospace
(`Geist_Mono` or `JetBrains_Mono`), exposed as `--font-geist-sans` / `--font-mono`.

---

## 2. Type & status scale

| Use | Token / class |
| --- | ------------- |
| Section / field labels | `.label-mono` (uppercase mono, `fg-muted`) |
| Body | `font-sans`, `text-fg` |
| Numeric / code-like values | `font-mono`, `text-fg` |
| PASS | `text-pass` + `bg-pass-soft`, check icon |
| FAIL | `text-fail` + `bg-fail-soft`, x icon, **left accent border** on the row |
| ELIGIBLE | `text-pass` badge |
| NOT_ELIGIBLE | `text-fail` badge |
| Confidence fill | `bg-accent` on a `bg-surface-2` track |

Status is **never color-only** — always icon + text (a11y).

---

## 3. Box layout primitives — `components/ui/`

Thin, presentational, polymorphic. They own spacing/alignment, nothing else.

```ts
// Box — polymorphic surface with optional variant (cva)
interface BoxProps { as?: ElementType; surface?: "none" | "surface" | "surface-2" | "elevated";
                     bordered?: boolean; radius?: "sm" | "md" | "lg"; p?: 0|2|3|4|6; className?: string }

// Stack — vertical flow with a gap
interface StackProps { gap?: 1|2|3|4|6|8; align?: "start"|"center"|"stretch"; className?: string }

// Cluster — horizontal, wraps, gap + alignment (rows of chips, label+value)
interface ClusterProps { gap?: 1|2|3|4; align?: "center"|"baseline"|"start"; justify?: "start"|"between"; wrap?: boolean }

// Grid — responsive columns
interface GridProps { cols?: 1|2|3|4; minItem?: string /* e.g. "16rem" */; gap?: 2|3|4|6 }
```

Implement variants with **cva** + `cn()`. Keep the prop surface small; reach for raw
Tailwind utilities for one-offs rather than growing these.

---

## 4. Layout shells — `components/layout/`

```ts
// AppShell — page frame: sticky header + scrollable main
<AppShell header={<Header/>}>{children}</AppShell>

// Container — max-width + responsive horizontal padding
<Container size="xl">…</Container>           // max-w ~1200px, mx-auto, px-4 md:px-6

// PageGrid — the two-pane Rule Engine grid
<PageGrid>{leftPane}{rightPane}</PageGrid>
//   mobile : 1 column (form, then results)
//   ≥lg    : 2 columns  → grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6
//                          (results pane slightly wider; both panes independently scroll)

// Panel — titled surface region (a labelled Card)
<Panel title="REAL-TIME RULE MATCH" icon={<Activity/>}>…</Panel>
//   bg-surface, border border-border, rounded-lg, p-4/6; title uses .label-mono
```

### Page map — `/`

```
┌─ AppShell ───────────────────────────────────────────────────────────────┐
│  Header:  ◧ RULE ENGINE            ● live                                   │
│ ┌─ Container ──────────────────────────────────────────────────────────┐  │
│ │ ┌─ PageGrid (1col → 2col @lg) ────────────────────────────────────┐   │  │
│ │ │ ┌ Panel "APPLICANT" ─────────┐  ┌ Panel "REAL-TIME RULE MATCH" ─┐ │   │  │
│ │ │ │ Stack of field groups:     │  │ StatusBadge (eligibility)     │ │   │  │
│ │ │ │  • Credit (cibil, wo…)     │  │ ConfidenceBar  98.2% �%        │ │   │  │
│ │ │ │  • Demographics (age…)     │  │ EligibleBanks (chips)         │ │   │  │
│ │ │ │  • Employment & Income     │  │ bank selector → BankRuleList: │ │   │  │
│ │ │ │  • Write-offs (toggles)    │  │   RuleRow ✓ CIBIL …     PASS  │ │   │  │
│ │ │ │  • BRE flags (toggles)     │  │   RuleRow ✗ WO_CHECK …  FAIL  │ │   │  │
│ │ │ └────────────────────────────┘  └───────────────────────────────┘ │   │  │
│ │ └──────────────────────────────────────────────────────────────────┘   │  │
│ └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Presentational design-system components (scoped here, logic-free)

These are *visual* building blocks — they take data props, render tokens, emit no fetches.

```ts
// SectionLabel — the .label-mono header used across panels
<SectionLabel>CONFIDENCE_SCORE</SectionLabel>

// StatusBadge — PASS | FAIL | ELIGIBLE | NOT_ELIGIBLE
<StatusBadge status="PASS" />          // icon + text, color from semantic tokens

// ConfidenceBar — track + accent fill + right-aligned %
<ConfidenceBar value={0.982} />        // bg-surface-2 track, bg-accent fill (rounded-pill), label-mono %

// RuleRow — one rule line in the match panel
<RuleRow parameter="WO_CHECK_HOME" rule="false" value={true} status="FAIL" />
//   FAIL → bg-fail-soft, border-l-2 border-fail; PASS → check, neutral row
```

The Stitch pass refines these visuals; their **prop contracts stay stable** so the
feature layer (`features/rule-engine/components/*`) never breaks.

---

## 6. Responsive & motion

- **Breakpoints:** single column < `lg` (1024px); two columns ≥ `lg`. Panels scroll independently on desktop.
- **Touch targets:** ≥ 40px; toggles and selects keyboard-operable.
- **Motion:** confidence-bar fill animates `width` ~200ms ease-out; gate all motion behind `prefers-reduced-motion: reduce`.

---

## 7. Do / Don't

- ✅ Compose pages from `PageGrid` / `Panel` / `Stack` / `Card` + tokens.
- ✅ Add a new color/space only by adding a **token** in `@theme`.
- ❌ No hex/px in components. ❌ No business logic in `ui/` or `layout/`.
- ❌ Don't fork a primitive to restyle one screen — extend variants or use utilities.
