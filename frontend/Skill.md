# Frontend Engineering Standards — Rule Engine

> Companion to the backend `skill.md`. This is the **always-on** ruleset for any
> agent/dev building the frontend. Scope of the *current* milestone: the Rule
> Engine page at `/` plus the **global + layout** design architecture it sits on.

## 0. Stack (do not change without a decision record)

| Concern | Choice | Notes |
| ------- | ------ | ----- |
| Framework | **Next.js 16** (App Router, RSC) | ⚠️ Next 16 has breaking changes vs. your training data. **Read `node_modules/next/dist/docs/` before writing Next APIs** (per `AGENTS.md`). |
| UI | **React 19** | Server Components by default; interactive parts are client islands. |
| Styling | **Tailwind CSS v4** | CSS-first config: tokens live in `app/globals.css` via `@theme`. **No `tailwind.config.js`.** |
| Language | **TypeScript 5, `strict`** | No `any`, no non-null `!` to silence errors. |
| Server state | **@tanstack/react-query v5** | the `/rule-engine/evaluate` call: dedup, cancellation, `keepPreviousData`. |
| Form state | **react-hook-form + zod** | 23-field applicant form; zod resolver mirrors backend constraints. |
| UI state | local `useState` / `useReducer`; **zustand** only if shared across distant components | Don't reach for a store you don't need. |
| Variants | **cva** + **tailwind-merge** + **clsx** (`cn()`) | typed component variants. |
| Icons | **lucide-react** | check / x / activity icons. |
| Types from API | **openapi-typescript** | generate from the backend `/openapi.json` — never hand-write response types. |
| Tests | **vitest** + **@testing-library/react** + **msw** | mock the evaluate endpoint. |
| Lint/format | **eslint (flat, eslint-config-next)** + **prettier** | CI-gated. |

## 1. Architecture principles

- **Feature-sliced.** Business code lives under `features/rule-engine/`. Shared,
  reusable UI lives under `components/ui` (design system) and `components/layout`.
- **Design system is presentational only.** `components/ui` + `components/layout`
  know nothing about applicants, banks, or fetching. They take props and render.
- **Server state ≠ UI state ≠ form state.** Each has one owner: React Query owns
  the API result; react-hook-form owns inputs; components own ephemeral UI.
- **One data-flow direction.** Inputs → form values → (debounced) evaluate →
  result → presentational components. No component fetches on its own.
- **Tokens, not hex.** Every color/space/radius/font comes from a CSS variable in
  `@theme`. A raw hex in a component is a bug.
- **The page is composition.** `app/page.tsx` wires layout + feature; it contains
  no styling logic and no business logic.

## 2. Folder conventions

```
app/            # routes, root layout, globals (Next App Router)
components/
  ui/           # design-system primitives (Box, Stack, Grid, Card, Badge, …)
  layout/       # AppShell, PageGrid, Panel — page scaffolding
features/
  rule-engine/  # the feature: form, evaluate hook, results, state, handlers
lib/            # cn(), api client, query client, env
```

- One component per file, `PascalCase.tsx`; hooks `useThing.ts`; pure utils `thing.ts`.
- Co-locate a component's variants/types in the same file unless shared.
- Public surface of a folder via `index.ts` barrels (keep thin).

## 3. Performance & latency (this product is "real-time")

The backend evaluates in microseconds — **the round-trip is the only cost**, so:

- **Debounce** form→evaluate at ~250 ms (`useDebouncedValue` / leading-edge skip).
- **Cancel stale requests** with `AbortController` (React Query does this per key).
- **`keepPreviousData: true`** so the rule-match panel never flashes empty between keystrokes.
- **`useDeferredValue` / `useTransition`** (React 19) to keep typing responsive
  while the result panel re-renders.
- **Memoize** the heavy result panel (`React.memo` + stable selectors) — typing in
  one field must not re-render 8 banks × 23 rules unnecessarily.
- **Proxy through a Next route/rewrite** (`/api/backend/*` → backend) to avoid CORS
  and keep the backend URL server-side.

## 4. Quality gates (what CI runs — must be green to merge)

```bash
npm run lint            # eslint flat config
npx tsc --noEmit        # strict types
npm run test            # vitest
npm run build           # next build must succeed
```

## 5. Accessibility & UX baseline

- Every input has a `<label>`; the form is keyboard-complete and submits without a mouse.
- Status is never color-only: PASS/FAIL also carry an icon + text.
- Respect `prefers-reduced-motion`; dark-first, but tokens allow a future light theme.
- Loading uses skeletons (not spinners) on first load; subsequent updates are seamless.

## 6. Hard rules

- ❌ No `any`, no `@ts-ignore` to hide a real type error.
- ❌ No business logic in `components/ui` or `components/layout`.
- ❌ No raw colors/spacing — only `@theme` tokens / Tailwind utilities derived from them.
- ❌ No fetching inside presentational components.
- ✅ Response types are **generated** from the backend OpenAPI schema.
