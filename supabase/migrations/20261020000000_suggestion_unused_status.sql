-- 'unused': a native speaker says nobody actually uses the word; steers future picks.
alter table public.daily_suggestions drop constraint daily_suggestions_status_check;
alter table public.daily_suggestions add constraint daily_suggestions_status_check
  check (status in ('pending', 'saved', 'known', 'skipped', 'unused'));
