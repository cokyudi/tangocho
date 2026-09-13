export default function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} view`}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-11 w-11 items-center justify-center border-2 border-ink shadow-retro-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 ${
        active ? 'bg-accent text-on-accent' : 'bg-surface text-fg'
      }`}
    >
      {children}
    </button>
  );
}
