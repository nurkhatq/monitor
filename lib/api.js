// All requests go through /api/proxy/* so Vercel (HTTPS) → VPS (HTTP) never hits mixed-content block
const BASE = '/api/proxy';

async function req(path, opts = {}) {
  const r = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || r.statusText);
  }
  return r.json();
}

export const api = {
  getPosts:      (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return req(`/posts${qs ? '?' + qs : ''}`);
  },
  getPost:       id => req(`/posts/${id}`),
  updatePost:    (id, body) => req(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  replyPost:     (id, text) => req(`/posts/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }) }),
  fetchComments: id => req(`/posts/${id}/fetch-comments`, { method: 'POST' }),
  getStats:      () => req('/stats'),
  getRuns:       () => req('/monitor/runs'),
  getLog:        () => req('/monitor/log'),
  triggerRun:    () => req('/monitor/run', { method: 'POST' }),
  getAccounts:   () => req('/accounts'),
  uploadCookies: (username, cookies) =>
    req('/cookies', { method: 'PUT', body: JSON.stringify({ username, cookies }) }),
};
