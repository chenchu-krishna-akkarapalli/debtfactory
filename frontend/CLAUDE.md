@AGENTS.md
@Skill.md

# Rule Engine frontend

Building the Rule Engine page at `/` against the backend `POST /rule-engine/evaluate`.

- **`Skill.md`** — engineering standards (stack, conventions, latency rules). Always applies.
- **`prompt.md`** — what to build: scope, the backend request/response contract, page spec, acceptance criteria.
- **`plan.md`** — build order + the state / handler / latency architecture (read before coding).
- **`docs/design-system.md`** — global tokens (`app/globals.css` `@theme`) + the box-layout primitives.

⚠️ Next.js 16 has breaking changes — read `node_modules/next/dist/docs/` before using Next APIs (see `AGENTS.md`).
Stitch MCP (when connected) is the **visual** source of truth; fold its palette/spacing into the `@theme` tokens, don't hand-roll new ones.
