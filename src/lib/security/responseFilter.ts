const LEAK_PATTERNS = [
  /system prompt/i,
  /ignore previous instructions/i,
  /reveal.*prompt/i,
  /show.*system/i,
  /as an ai language model/i,
  /you are a concise, accurate ai assistant/i,
];

export function cleanAssistantResponse(input: string): string {
  let text = input.replace(/\u0000/g, "").trim();
  text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  if (LEAK_PATTERNS.some((re) => re.test(text))) {
    return "Could not verify that safely.";
  }

  return text;
}
