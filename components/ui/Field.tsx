export const inputClass =
  'w-full border-2 border-ink bg-surface px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export default function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${full ? 'col-span-2' : ''}`}>
      <label className="block text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}
