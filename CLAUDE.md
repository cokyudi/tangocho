# tangocho (単語帳)

Personal, single-user Japanese vocabulary tracker. Capture words (AI auto-fill), Browse, Practice (SM-2 flashcards). Retro/brutalist UI mirroring the portfolio at `../yudi-simple-portfolio`.

Full build spec: [`docs/SPEC.md`](docs/SPEC.md).

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 3.4, **npm** (ESM).
- Supabase: Postgres + Google OAuth (single-user email allowlist). Migrations in `supabase/migrations/`.
- AI: Vercel AI SDK v6 + `@ai-sdk/google` (direct, free `GOOGLE_GENERATIVE_AI_API_KEY`), model `gemini-2.5-flash`. **Not** AI Gateway.
- Dictionary: Jisho public API primary; Gemini fallback for slang + always supplies Indonesian meaning + example.
- Hosting: Vercel Hobby, domain `tangocho.yudidputra.com`. PWA (installable, offline shell).
- **Everything is free tier** (GitHub free, Vercel Hobby, Supabase Free, Google AI Studio). Keep non-commercial.

## Commands

- `npm run dev` — local dev server (Turbopack, http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (`eslint-config-next`)
- `npm test` — unit tests (vitest; SM-2 logic in `lib/srs.ts`) — _added in Phase 4_
- `vercel deploy` / `vercel deploy --prod` — deploy (CLI: `npm i -g vercel`)
- `supabase migration new <name>` / `supabase db push` — schema changes — _added in Phase 1_

## Conventions

- Folder layout mirrors the portfolio: `app/`, `components/ui/`, `lib/`, `constants/`. Path alias `@/*`.
- **Design system is copied from `../yudi-simple-portfolio`** — do not add a UI library. Reuse `components/ui/{Card,Button,Badge}.tsx`, `globals.css` tokens, retro shadows (`retro-sm/retro/retro-lg`, hard offset, no blur), `border-2 border-ink`, graph-paper grid, Space Grotesk + Geist + **Noto Sans JP**, `next-themes` dark mode.
- **No AI-slop UI**: one consistent line-icon set (Lucide/Phosphor, single weight); no AI imagery, gradient blobs, emoji-branding, or stock illustrations. Restraint over flourish — the retro grid/shadow language carries personality.
- RLS on every table (`user_id = auth.uid()`); email allowlist (`ALLOWED_EMAIL`) enforced in middleware; secrets server-only.
- Prefer editing existing files; don't add abstractions, error handling, or comments beyond the task.

## Env vars

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALLOWED_EMAIL`, `GOOGLE_GENERATIVE_AI_API_KEY`. Manage via `vercel env`.

## Build phases

Dependency-ordered, each sized for one Claude Pro 5-hour window, ends with commit + deploy:
0. Scaffold + design system + deploy skeleton
1. Auth (Google OAuth + allowlist) + DB schema + RLS
2. Capture (Jisho + Gemini auto-fill, structured sources, <10s flow)
3. Browse (table + bento grid, filters, edit/delete)
4. Practice (SM-2 engine + flashcards + due badge) — MVP complete
5. PWA + progress dashboard + a11y/perf polish
6. (Optional) Push reminders (iOS 26+, Vercel cron)
