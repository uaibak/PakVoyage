interface FilterChipProps {
  label: string;
}

export function FilterChip({ label }: FilterChipProps) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
      {label}
    </span>
  );
}
