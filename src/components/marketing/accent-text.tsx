type AccentTextProps = {
  text: string;
  animated?: boolean;
  words?: number;
};

export function AccentText({ text, animated = false, words }: AccentTextProps) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return <>{text}</>;

  const accentCount = words
    ? Math.min(words, parts.length - 1)
    : Math.max(1, Math.ceil(parts.length * 0.35));
  const start = parts.length - accentCount;
  const className = animated ? "mk-accent mk-accent--sheen" : "mk-accent";

  return (
    <>
      {parts.slice(0, start).join(" ")}{" "}
      <span className={className}>{parts.slice(start).join(" ")}</span>
    </>
  );
}
