const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const NUMBER_CANDIDATE_REGEX = /\+?\d(?:[\d\s().-]*\d)?/g;

export const CHAT_EMAIL_REJECTION =
  "For security, email addresses cannot be shared in chat.";

export const CHAT_LONG_NUMBER_REJECTION =
  "For security, numbers longer than 6 digits cannot be shared in chat.";

export function containsEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function containsLongNumber(value: string): boolean {
  return Array.from(value.matchAll(NUMBER_CANDIDATE_REGEX)).some((match) => {
    const digitCount = (match[0].match(/\d/g) ?? []).length;
    return digitCount > 6;
  });
}

export function getChatContentRejection(value: string): string | null {
  if (containsEmail(value)) return CHAT_EMAIL_REJECTION;
  if (containsLongNumber(value)) return CHAT_LONG_NUMBER_REJECTION;
  return null;
}
