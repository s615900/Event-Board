import 'server-only';

// Minimal stand-in for the pino logger the Express server used: same
// `logger.level(context?, message)` call shape, printed as one JSON line.
type Level = 'info' | 'warn' | 'error';

function log(level: Level, contextOrMessage: unknown, message?: string): void {
  const entry =
    typeof contextOrMessage === 'string'
      ? { level, msg: contextOrMessage }
      : { level, msg: message, ...serialize(contextOrMessage) };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

function serialize(context: unknown): Record<string, unknown> {
  if (!context || typeof context !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    out[key] = value instanceof Error ? { name: value.name, message: value.message } : value;
  }
  return out;
}

export const logger = {
  info: (contextOrMessage: unknown, message?: string) => log('info', contextOrMessage, message),
  warn: (contextOrMessage: unknown, message?: string) => log('warn', contextOrMessage, message),
  error: (contextOrMessage: unknown, message?: string) => log('error', contextOrMessage, message),
};
