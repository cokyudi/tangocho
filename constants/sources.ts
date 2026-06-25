export const SOURCE_TYPES = ['drama', 'anime', 'person', 'social', 'other'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  drama: 'Drama',
  anime: 'Anime',
  person: 'Person',
  social: 'Social',
  other: 'Other',
};
