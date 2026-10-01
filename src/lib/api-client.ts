// Browser-side calls to the /api route handlers.

export type ApiResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : '';
      return { ok: false, error: message || '操作失敗，請稍後再試' };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: '無法連線，請檢查網路後再試' };
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T = unknown>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T = unknown>(path: string, body: unknown) => request<T>('PUT', path, body),
  del: <T = unknown>(path: string) => request<T>('DELETE', path),
};
