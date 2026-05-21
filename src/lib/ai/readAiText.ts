export function readAiText(ai: unknown): string {
  if (typeof ai === "string") return ai;
  const obj = ai as { response?: string; text?: string } | null;
  return obj?.response ?? obj?.text ?? "";
}
