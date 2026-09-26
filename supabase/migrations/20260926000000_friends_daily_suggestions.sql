-- Phase 7: AI "friends" who each mention a word in a one-line message.
-- Each friend owns a 'person' source, so saved words are tagged with that friend.

create table public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  name text not null,
  relationship text not null check (relationship in ('friend', 'coworker')),
  themes text[] not null default '{}',
  persona text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Up to 4 per Tokyo day. Holds the full word data from the one daily Gemini
-- call, so saving needs no further AI requests.
create table public.daily_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  friend_id uuid not null references public.friends (id) on delete cascade,
  term text not null,
  reading text,
  meaning_en text,
  meaning_id text,
  part_of_speech text,
  jlpt text,
  line_ja text not null,              -- the friend's line, clean
  line_furigana text,                 -- same line in the 漢字[かな] convention
  line_en text,
  line_id text,                       -- Indonesian, becomes example_translation
  status text not null default 'pending'
    check (status in ('pending', 'saved', 'known', 'skipped')),
  word_id uuid references public.words (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, date, term)
);

create index friends_user_idx on public.friends (user_id);
create index daily_suggestions_user_date_idx on public.daily_suggestions (user_id, date);

alter table public.friends enable row level security;
alter table public.daily_suggestions enable row level security;

create policy "friends are owner-only"
  on public.friends for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_suggestions are owner-only"
  on public.daily_suggestions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
