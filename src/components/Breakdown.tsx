interface Props {
  title: string;
  data: Map<string, number>;
}

export default function Breakdown({ title, data }: Props) {
  const entries = [...data.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (entries.length === 0) return null;
  const max = entries[0][1];
  return (
    <section className="card p-4">
      <h3 className="mb-3 text-sm font-bold text-ink-3 uppercase tracking-wide">{title}</h3>
      <div className="flex flex-col gap-2.5">
        {entries.map(([label, count]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-sm font-medium capitalize text-ink-2">{label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--c-surface-3)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%`, background: 'var(--c-accent)' }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-bold text-ink-3">
              {count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
