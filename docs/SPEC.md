# tangocho (単語帳) — Build Spec

## Context

A personal Japanese vocabulary tracker for one user (an Indonesian dev living in Japan). The
problem: words heard daily (friends, dramas, anime, social, signs) get forgotten because
capture is messy and there's no review loop. tangocho fixes this with three loops:

- **Capture** — type a word, AI auto-fills reading + Indonesian + English + example in <10s, tag where it was learned.
- **Browse** — filterable list of all words (by source, mastery, due).
- **Practice** — SM-2 spaced-repetition flashcards so saved words actually stick.

Secondary goal: a portfolio piece proving full-stack shipping ability, visually matching the
existing portfolio at `yudi-simple-portfolio` (retro/brutalist aesthetic).

This spec is **split into self-contained phases**. Each phase is dependency-ordered, ends with a
commit + deploy, and is sized to finish inside a single Claude Pro 5-hour window — so work never
stops mid-feature. Resume = start the next phase cold.

---

## Decisions (locked)

| Area | Decision |
|---|---|
| **Users** | Single user. Google OAuth + **email allowlist** (`ALLOWED_EMAIL` env). No signup flow. |
| **Source model** | **Structured**: `type` (drama/anime/person/social/other) + `name` + optional `detail` (e.g. "S2 Ep.3"). Autocomplete from past sources. |
| **Reminders** | **In-app due badge** ("N words due") for MVP. PWA push in Phase 6 — viable since user is on **iOS 26+**. |
| **AI auto-fill** | **Jisho primary → Gemini fallback.** Jisho gives reading/EN/POS/JLPT; if Jisho has no entry (slang, casual, new words), Gemini fills everything. Gemini always supplies the **Indonesian** meaning + example sentence (Jisho has neither). |
| **AI wiring** | **Vercel AI SDK v6 + `@ai-sdk/google`** (direct), model `gemini-2.5-flash`, `generateObject` + Zod schema. **Free Google AI Studio key** (`GOOGLE_GENERATIVE_AI_API_KEY`) — **not** AI Gateway, which can incur Vercel billing. |
| **Workflow** | **Fully autonomous dev**: GitHub via `gh` CLI, DB migrations via **Supabase CLI/MCP**, deploys + env via **Vercel CLI**. |
| **Hosting tier** | **All free tier**: GitHub free (private repo), Vercel Hobby, Supabase Free, Google AI Studio free. Personal/non-commercial — compliant with Hobby terms. |
| **Stack** | Next.js 16 App Router, React 19, TypeScript (strict), Tailwind 3.4, npm, Supabase (Postgres + Google OAuth), Vercel. Matches portfolio versions. |
| **Domain** | `tangocho.yudidputra.com` (separate Vercel project + subdomain). |
| **PWA** | Installable, offline shell, home-screen icon. |

**Non-goals:** multi-user, sharing, audio/TTS, image OCR, native apps, web-push (until Phase 6).

---

## Design system (mirror the portfolio)

Port from `../yudi-simple-portfolio`. Do **not** introduce a UI library — copy the custom primitives and tokens.

- **Palette (CSS vars in `globals.css`)** — light: `--paper #faf6ec`, `--surface #fefcf7`, `--ink #141414`, `--fg #3a3a3a`, `--accent #0f766e`, `--highlight #f59e0b`, `--muted #6b6b6b`. Dark: `--paper #15130d`, `--surface #201d14`, `--ink #ede9e0`, `--accent #14b8a6`, `--highlight #fbbf24`.
- **Shadows** — hard offset, no blur: `retro-sm 2px`, `retro 4px`, `retro-lg 6px`. Shadow disappears on `:active`.
- **Borders** — `border-2 border-ink` on all interactive elements.
- **Fonts** — Space Grotesk (display/headings/buttons), Geist Sans (body) + **Noto Sans JP** (essential for Japanese rendering).
- **Background** — graph-paper grid, 40px, ink @5%, fixed.
- **Motion** — Framer Motion entrances + hover lift; `next-themes` class-based dark mode; respect `prefers-reduced-motion`.
- **Primitives to copy** — `components/ui/Card.tsx`, `Button.tsx`, `Badge.tsx` (translate-on-hover, ring-focus).
- **No AI-slop rule** — deliberate, restrained UI. One consistent line-icon set (Lucide or Phosphor, single weight); **no** generic AI-generated imagery, no gradient blobs, no emoji-as-branding, no stock "vibrant" illustrations. Icons earn their place or are omitted. The retro grid/shadow language carries the personality, not decoration.

Japanese-specific additions: large furigana-over-kanji display component (`ruby`/`rt`), big tappable flashcard, mobile-first **bottom tab nav** (Capture / Browse / Practice).

---

## Data model (Supabase Postgres)

All tables carry `user_id uuid` (= `auth.uid()`), RLS `user_id = auth.uid()` on every table.

```
sources
  id uuid pk, user_id, type text check in (drama,anime,person,social,other),
  name text, detail text null, created_at

words
  id uuid pk, user_id, source_id uuid fk null,
  term text,            -- 日本語
  reading text,         -- furigana (kana)
  meaning_id text,      -- Indonesian
  meaning_en text,
  part_of_speech text null,
  jlpt text null,       -- N5..N1
  example_jp text null,
  example_translation text null,  -- ID
  notes text null,
  -- SM-2 state:
  ease_factor numeric default 2.5,
  interval int default 0,         -- days
  repetitions int default 0,
  due_date date null,             -- null until first review scheduled
  last_reviewed_at timestamptz null,
  created_at, updated_at

review_logs   -- for progress stats & history
  id uuid pk, user_id, word_id fk,
  rating text check in (forgot,hard,easy),
  prev_interval int, new_interval int, prev_ef numeric, new_ef numeric,
  reviewed_at timestamptz default now()
```

**Mastery level** (derived, not stored): New (`repetitions=0`) · Learning (`interval<7`) · Young (`7–21`) · Mature (`21–90`) · Mastered (`>90`).

**SM-2 (3-button variant)** — map button → quality `q`: forgot→`2` (fail), hard→`3`, easy→`5`.
- `q<3`: `repetitions=0`, `interval=1`.
- else: `repetitions==0`→`interval=1`; `==1`→`interval=6`; else `interval=round(interval*EF)`; `repetitions+=1`.
- `EF' = max(1.3, EF + (0.1 − (5−q)·(0.08 + (5−q)·0.02)))`.
- `due_date = today + interval`. Implement as a pure function `lib/srs.ts` with unit tests.

---

## Phases

> Each phase: **commit + deploy** at the end. Each is independently shippable.

### Phase 0 — Scaffold + design system + deploy skeleton
- `gh repo create tangocho` (private); `npm i -g vercel`; `vercel login` (user via `!`) if needed.
- `create-next-app` (App Router, TS, Tailwind, npm), match portfolio versions (Next 16 / React 19 / Tailwind 3.4). `@/*` path alias.
- Port `globals.css` tokens, `tailwind.config.js` (retro shadows, fonts), grid background, `next-themes` + `ThemeSwitch`.
- Fonts in `app/layout.tsx`: Space Grotesk + Geist + Noto Sans JP.
- Copy `components/ui/{Card,Button,Badge}.tsx`.
- App shell: root layout + mobile-first bottom tab nav; stub routes `/capture`, `/browse`, `/practice`.
- New Vercel project, link, add domain `tangocho.yudidputra.com`, deploy.
- **Deliverable:** deployed empty retro shell, dark mode works, installable-looking. **Verify:** open subdomain on phone, all 3 tabs render.

### Phase 1 — Auth + DB schema + RLS
- Supabase project; enable Google OAuth provider; configure redirect URLs.
- `@supabase/ssr`: `lib/supabase/{server,client}.ts`, `middleware.ts` for session refresh + route protection.
- Sign-in page; OAuth callback route `app/auth/callback/route.ts`.
- **Email allowlist**: middleware/server check `session.email === ALLOWED_EMAIL`, else friendly "not you" screen + sign-out.
- SQL migrations for `sources`, `words`, `review_logs` + RLS policies (`user_id = auth.uid()`), `updated_at` trigger.
- **Deliverable:** only your Google email gets in; tables exist with RLS. **Verify:** sign in works; a second Google account is rejected; `select` as anon returns nothing.

### Phase 2 — Capture (the <10s flow)
- `app/api/enrich/route.ts`: POST `{ term }` →
  1. Query Jisho (`jisho.org/api/v1/search/words?keyword=`). If a confident entry exists, take **reading, EN meaning, POS, JLPT** from it.
  2. Always call Gemini via `generateObject({ model: google('gemini-2.5-flash'), schema })` (`@ai-sdk/google`, free key) for the **Indonesian meaning + example sentence (JP + ID)**; if Jisho returned nothing (slang/casual/new word), Gemini also fills reading/EN/POS. Zod schema shared client/server.
  - Response shape: `{reading, meaningId, meaningEn, partOfSpeech, jlpt, exampleJp, exampleTranslation, source: 'jisho'|'gemini'}`.
- Capture form: type term → debounced auto-enrich → editable prefilled fields → save. Optimistic, focus-first, Enter-to-save. Small badge shows whether data came from Jisho or Gemini.
- Structured source picker: type-ahead combobox over existing `sources` (group by type) + "add new" inline.
- Server action / route to insert `word` (+ create `source` if new).
- **Deliverable:** add a word end-to-end in <10s, slang included. **Verify:** 食べる fills from Jisho; a slang term (e.g. ぴえん) falls back to Gemini; pick source → save → row in DB.

### Phase 3 — Browse
- Server-fetched word list. **Table view** (default) + **bento floating-card grid** toggle (persist choice in localStorage).
- Furigana display on each word.
- Filters: source (multi), mastery level, **due-only** toggle; text search over term/reading/meanings.
- Row/card actions: edit (reuse capture form), delete (confirm).
- **Deliverable:** browse, filter, edit, delete. **Verify:** filters narrow correctly; edit persists; due-only matches `due_date <= today`.

### Phase 4 — Practice (SM-2)
- `lib/srs.ts` pure SM-2 function + unit tests (use the repo's test runner, e.g. vitest).
- Practice queue = words due today (`due_date <= today` OR never reviewed), ordered.
- Flashcard UI: show term (+ furigana toggle) → flip (animation) → reveal ID + EN + example + source context → rate **forgot / hard / easy**.
- On rate: compute SM-2, update `words` SRS fields, insert `review_log`. Advance queue.
- **In-app due badge**: "N due" on home + Practice tab.
- **Deliverable:** full review session reschedules words. **Verify:** rate forgot→due tomorrow; easy→interval grows; badge count decrements; `review_logs` written.

### Phase 5 — PWA + progress + polish
- `manifest.ts` + icons + service worker (offline app shell; e.g. Serwist or next-pwa). Installable on iOS/Android home screen.
- Progress dashboard: total words, mastery distribution, reviews-per-day streak/heatmap (from `review_logs`), words added over time.
- Empty states, loading skeletons, error toasts, keyboard shortcuts.
- A11y pass (`a11y-audit` skill) + perf pass (`perf-audit` skill); `@vercel/analytics` + speed-insights; CSP headers (copy portfolio `next.config.js`).
- **Deliverable:** installable PWA + progress view. **Verify:** install to home screen; offline shell loads; Lighthouse PWA + a11y green.

### Phase 6 — (Optional) Push reminders
- iOS 26+ supports web push for installed PWAs, so this is fully viable on the user's phone.
- web-push subscription + service-worker push handler; store subscription in DB.
- Vercel cron (`vercel.ts` crons) → daily function: if due>0, send "N words due" push.
- **Verify:** receive a real push on iPhone at scheduled time.

---

## Autonomous workflow (tooling)

Run each phase end-to-end without manual steps wherever possible:
- **GitHub** — `gh` CLI: create repo, branch per phase, commit, open + merge PRs.
- **Supabase** — Supabase CLI (`supabase migration new` / `db push`) and/or Supabase MCP for schema, RLS, OAuth config. Migrations live in repo (`supabase/migrations/`).
- **Vercel** — Vercel CLI: link project, `vercel env add`, `vercel deploy`, domain attach, `vercel logs`. **Note: Vercel CLI is not installed** — first step is `npm i -g vercel`.
- **Blocking points needing the user** (collect once, up front): Google OAuth client credentials, Supabase project keys, free Gemini API key, `ALLOWED_EMAIL`, domain DNS for the subdomain. Anything interactive (e.g. `gcloud`/Google Cloud OAuth consent, `vercel login`) the user runs via `! <command>`.

## Cross-cutting

- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALLOWED_EMAIL`, `GOOGLE_GENERATIVE_AI_API_KEY` (free AI Studio key). Manage via `vercel env`.
- **Security:** RLS everywhere; allowlist in middleware; secrets server-only; CSP from portfolio.
- **Conventions:** mirror portfolio folder layout (`app/`, `components/ui/`, `lib/`, `constants/`). Strict TS, ESM.

## End-to-end verification (after Phase 4 = MVP)
1. Sign in with allowed Google account on phone; reject a second account.
2. Capture 食べる: AI fills reading/ID/EN/example, tag "Midnight Diner / S2 Ep.3", save — under 10s.
3. Browse: filter by that source; toggle to bento grid; edit the word.
4. Practice: review the word, rate each option, confirm reschedule + badge update + `review_logs`.
5. Install PWA to home screen (Phase 5).

## Risks / watch-items
- **Gemini reading accuracy** — Jisho-primary covers standard words reliably; Gemini fallback (for slang) can misread — mitigate with editable fields.
- **iOS PWA push** — user is on iOS 26+, so Phase 6 push works once installed-to-home; in-app badge (Phase 4) is the MVP path regardless.
- **Vercel CLI not installed** — `npm i -g vercel` before any deploy/env step.
- **Free-tier limits** — Supabase Free pauses a project after ~7 days of inactivity (daily use avoids this; nightly cron in Phase 6 also keeps it warm). Vercel Hobby crons run **once/day max** — fine for the single daily reminder. Gemini free tier has per-minute/day request caps — acceptable for one user. Stay non-commercial to honor Hobby terms.
- **SM-2 same-day re-review** — "forgot" sets interval=1 (next day); acceptable for personal use vs sub-day relearning steps.
