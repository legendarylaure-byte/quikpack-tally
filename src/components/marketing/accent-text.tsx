type AccentTextProps = {
  text: string;
  words?: number;
  className?: string;
};

export function AccentText({ text, words, className = "" }: AccentTextProps) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return <>{text}</>;

  const accentCount = words
    ? Math.min(words, parts.length - 1)
    : Math.max(1, Math.ceil(parts.length * 0.35));
  const start = parts.length - accentCount;

  return (
    <>
      {parts.slice(0, start).join(" ")}{" "}
      <span className={`mk-accent ${className}`.trim()}>{parts.slice(start).join(" ")}</span>
    </>
  );
}
