import 'server-only';
import { logger } from './logger';
import { fetchRagicSheet } from './ragic';

export interface SheetConfig {
  sheetUrl: string | undefined;
  apiKey: string | undefined;
  envVarName: string;
}

export function sheetConfig(envVarName: string): SheetConfig {
  return {
    sheetUrl: process.env[envVarName],
    apiKey: process.env['RAGIC_API_KEY'],
    envVarName,
  };
}

function notConfigured({ sheetUrl, apiKey, envVarName }: SheetConfig): Response {
  logger.error(
    { sheetUrlConfigured: Boolean(sheetUrl), ragicApiKeyConfigured: Boolean(apiKey) },
    `${envVarName} is not configured`,
  );
  return Response.json({ error: `${envVarName} is not configured` }, { status: 500 });
}

// Proxies a whole Ragic sheet as-is (the client maps Chinese field labels itself).
export async function handleRagicRead(
  config: SheetConfig,
  transform?: (json: Record<string, Record<string, unknown>>) => unknown,
): Promise<Response> {
  const { sheetUrl, apiKey } = config;
  if (!sheetUrl || !apiKey) return notConfigured(config);

  let ragicRes: Response;
  try {
    ragicRes = await fetchRagicSheet(sheetUrl, apiKey);
  } catch (err) {
    logger.error({ err }, 'Failed to reach Ragic');
    return Response.json({ error: 'Failed to reach Ragic' }, { status: 502 });
  }
  if (!ragicRes.ok) {
    return Response.json({ error: 'Failed to fetch from Ragic', status: ragicRes.status }, { status: 502 });
  }
  const json = (await ragicRes.json()) as Record<string, Record<string, unknown>>;
  return Response.json(transform ? transform(json) : json);
}

// Returns the response to send plus the parsed Ragic payload on success, so
// callers can use it for follow-up work (e.g. a changelog entry); `data` is
// undefined on every failure path.
export async function handleRagicWrite(
  config: SheetConfig,
  operation: (sheetUrl: string, apiKey: string) => Promise<Response>,
  successStatus = 200,
): Promise<{ response: Response; data?: unknown }> {
  const { sheetUrl, apiKey } = config;
  if (!sheetUrl || !apiKey) return { response: notConfigured(config) };

  let ragicRes: Response;
  try {
    ragicRes = await operation(sheetUrl, apiKey);
  } catch (err) {
    logger.error({ err }, 'Failed to reach Ragic');
    return { response: Response.json({ error: 'Failed to reach Ragic' }, { status: 502 }) };
  }

  if (!ragicRes.ok) {
    logger.error({ status: ragicRes.status }, 'Ragic write request failed');
    return {
      response: Response.json({ error: 'Ragic request failed', status: ragicRes.status }, { status: 502 }),
    };
  }

  const data: unknown = await ragicRes.json();
  return { response: Response.json(data, { status: successStatus }), data };
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return ((await request.json()) ?? {}) as T;
  } catch {
    return {} as T;
  }
}
