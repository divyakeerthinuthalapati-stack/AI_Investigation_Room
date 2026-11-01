// In development, use Vite's same-origin proxy so localhost, 127.0.0.1,
// and LAN-hosted browser sessions all reach the local API consistently.
const base = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000')).replace(/\/$/, '');
const pendingInvestigationStarts = new Map();

export async function api(path, { method = 'GET', body, token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${base}/api/v1${path}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { 'X-Session-Token': token } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...options,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    const apiLocation = base || 'the Vite development proxy (127.0.0.1:5000)';
    throw new Error(`Cannot reach the API at ${apiLocation}. Make sure the backend is running.`, { cause: error });
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || 'The request could not be completed.');
  return payload.data;
}

export function startInvestigationOnce(caseId) {
  const existing = pendingInvestigationStarts.get(caseId);
  if (existing) return existing;
  const request = api(`/cases/${caseId}/investigations`, { method: 'POST' });
  pendingInvestigationStarts.set(caseId, request);
  const clear = () => {
    if (pendingInvestigationStarts.get(caseId) === request) pendingInvestigationStarts.delete(caseId);
  };
  request.then(clear, clear);
  return request;
}
