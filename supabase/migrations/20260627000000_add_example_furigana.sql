-- Furigana-annotated form of the example sentence, in the 漢字[かな] convention
-- (e.g. 今日[きょう]は学校[がっこう]へ行[い]く。). example_jp stays the clean sentence.
alter table public.words add column example_furigana text;
