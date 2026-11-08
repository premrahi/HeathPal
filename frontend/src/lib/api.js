export class ApiError extends Error {
  constructor(message, status, data) { super(message); this.status = status; this.data = data; }
}
export async function api(path, { method = 'GET', body, signal } = {}) {
  const form = body instanceof FormData;
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method, credentials: 'include', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60000)]) : AbortSignal.timeout(60000),
      headers: { 'X-HealthPal': '1', ...(!form && body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      ...(body !== undefined ? { body: form ? body : JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !['/auth/login', '/auth/me'].includes(path)) window.dispatchEvent(new Event('healthpal:unauthorized'));
    throw new ApiError(data.message || 'Request failed. Please try again.', response.status, data);
  }
  return data;
}
