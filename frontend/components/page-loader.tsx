interface PageLoaderProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageLoader({
  eyebrow = 'PakVoyage',
  title,
  description,
}: PageLoaderProps) {
  return (
    <div className="shell flex min-h-[72vh] items-center justify-center py-16">
      <div className="premium-card soft-grid w-full max-w-4xl overflow-hidden p-10 text-center md:p-14">
        <p className="eyebrow">{eyebrow}</p>

        <div className="mt-8 flex justify-center">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border border-[rgba(34,101,74,0.16)] bg-[linear-gradient(135deg,rgba(34,101,74,0.08),rgba(198,154,83,0.12))]" />
            <div className="absolute inset-3 rounded-full border border-[rgba(34,101,74,0.12)] bg-white/80" />
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[var(--emerald)] border-r-[var(--gold)]" />
          </div>
        </div>

        <h1 className="mt-8 text-4xl text-slate-950 [font-family:var(--font-heading)] md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          {description}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-[28px] border border-slate-200/70 bg-white/75"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
