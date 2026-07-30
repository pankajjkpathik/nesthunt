interface Props {
  summary: string | null | undefined;
}

/** Executive summary block — hidden entirely when the CMS has no summary. */
export function BuilderExecutiveSummary({ summary }: Props) {
  const text = (summary ?? "").trim();
  if (!text) return null;

  return (
    <section aria-labelledby="executive-summary-heading" className="mx-auto w-full max-w-[800px]">
      <h2
        id="executive-summary-heading"
        className="font-display text-xl font-semibold tracking-tight text-foreground"
      >
        Executive Summary
      </h2>
      <div className="mt-4 space-y-4">
        {text.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
