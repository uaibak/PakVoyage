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
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl rounded-[2.5rem] border border-slate-200 bg-white/90 p-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-700">{eyebrow}</p>

        <div className="mt-8 flex justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-500 border-r-amber-400" />
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-semibold text-slate-950">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
          {description}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-[1.5rem] bg-slate-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
