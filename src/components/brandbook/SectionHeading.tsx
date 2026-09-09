export function SectionHeading({
  n,
  kicker,
  title,
  italic,
  intro,
  dark = false,
}: {
  n: string;
  kicker: string;
  title: string;
  italic?: string;
  intro?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-[680px]">
      <span
        className={`subheading text-[10.5px] uppercase tracking-[0.16em] ${
          dark ? "text-gold" : "text-gold-deep"
        }`}
      >
        {n} — {kicker}
      </span>
      <h2
        className={`font-serif-display mt-3 text-[28px] leading-tight sm:text-[36px] ${
          dark ? "text-white" : "text-navy"
        }`}
      >
        {title}
        {italic && <em className="italic text-koralle"> {italic}</em>}
      </h2>
      {intro && (
        <p className={`mt-4 text-[14.5px] leading-relaxed ${dark ? "text-fog" : "text-muted"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
