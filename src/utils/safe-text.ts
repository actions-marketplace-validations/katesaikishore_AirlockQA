/**
 * Make text from an untrusted source (a server response, a page) safe to print in a terminal:
 * control characters, including ESC, which starts terminal escape sequences, become "?".
 */
const CONTROL_CHARACTERS = new RegExp(
  '[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + '-' + String.fromCharCode(159) +
    String.fromCharCode(0x2028) + String.fromCharCode(0x2029) + ']',
  'g'
);

export function safeText(value: unknown, maxLength = 500): string {
  const text = String(value ?? '').replace(CONTROL_CHARACTERS, '?');
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

/** A file-name-safe form of an identifier. */
export function safeFileName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80) || 'run';
}
