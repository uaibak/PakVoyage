interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  theme?: 'light' | 'dark';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  theme = 'light',
}: SectionHeadingProps) {
  const isDark = theme === 'dark';
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      <p className={`eyebrow ${isDark ? 'text-emerald-200' : ''}`}>{eyebrow}</p>
      <h2
        className={`mt-4 text-4xl leading-tight md:text-5xl [font-family:var(--font-heading)] ${
          isDark ? 'text-white' : 'text-slate-950'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-5 text-base leading-7 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
