-- tangocho initial schema: sources, words, review_logs
-- Single-user app, but every row is scoped by user_id + RLS so only the
-- authenticated owner can read/write their data.

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- where a word was learned: "Midnight Diner / S2 Ep.3", "Sato-san / at work", ...
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('drama', 'anime', 'person', 'social', 'other')),
  name text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table public.words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid references public.sources (id) on delete set null,
  term text not null,                 -- 日本語
  reading text,                       -- furigana (kana)
  meaning_id text,                    -- Indonesian
  meaning_en text,                    -- English
  part_of_speech text,
  jlpt text,                          -- N5..N1
  example_jp text,
  example_translation text,           -- Indonesian translation of example
  notes text,
  -- SM-2 state
  ease_factor numeric not null default 2.5,
  interval integer not null default 0,        -- days
  repetitions integer not null default 0,
  due_date date,                              -- null until first review scheduled
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id uuid not null references public.words (id) on delete cascade,
  rating text not null check (rating in ('forgot', 'hard', 'easy')),
  prev_interval integer,
  new_interval integer,
  prev_ef numeric,
  new_ef numeric,
  reviewed_at timestamptz not null default now()
);

create index sources_user_idx on public.sources (user_id);
create index words_user_due_idx on public.words (user_id, due_date);
create index words_user_source_idx on public.words (user_id, source_id);
create index review_logs_user_word_idx on public.review_logs (user_id, word_id);

create trigger words_set_updated_at
  before update on public.words
  for each row execute function public.set_updated_at();

-- Row Level Security: owner-only access on every table.
alter table public.sources enable row level security;
alter table public.words enable row level security;
alter table public.review_logs enable row level security;

create policy "sources are owner-only"
  on public.sources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "words are owner-only"
  on public.words for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "review_logs are owner-only"
  on public.review_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
