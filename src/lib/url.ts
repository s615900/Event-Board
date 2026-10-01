// Links typed in by staff are rendered as <a href>; only allow web URLs so a
// value like "javascript:..." can never become a clickable script.
export function safeHttpUrl(value: string | undefined): string | undefined {
  return value && /^https?:\/\//i.test(value.trim()) ? value.trim() : undefined;
}
