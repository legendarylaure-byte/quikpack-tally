export function totpHint<T extends { factorId: string }>(
  hints: T[],
): T | undefined {
  return hints.find((hint) => hint.factorId === "totp");
}
