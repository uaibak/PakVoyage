interface StatPillProps {
  label: string;
  value: string;
  tone?: 'light' | 'dark';
}

export function StatPill({
  label,
  value,
  tone = 'light',
}: StatPillProps) {
  const isDark = tone === 'dark';

  return (
    <div
      className={`rounded-full border px-4 py-3 ${
        isDark
          ? 'border-white/10 bg-white/5 text-white'
          : 'border-slate-200 bg-white/70 text-slate-950'
      }`}
    >
      <p className={`text-[11px] uppercase tracking-[0.22em] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
