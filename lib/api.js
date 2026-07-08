const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.238.41.18:3001';

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
  getPosts:     (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    )).toString();
    return req(`/api/posts${qs ? '?' + qs : ''}`);
  },
  getPost:      id => req(`/api/posts/${id}`),
  updatePost:   (id, body) => req(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  replyPost:    (id, text) => req(`/api/posts/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }) }),
  fetchComments:(id) => req(`/api/posts/${id}/fetch-comments`, { method: 'POST' }),
  getStats:     () => req('/api/stats'),
  getRuns:      () => req('/api/monitor/runs'),
  getLog:       () => req('/api/monitor/log'),
  triggerRun:   () => req('/api/monitor/run', { method: 'POST' }),
  uploadCookies:(username, cookies) =>
    req('/api/cookies', { method: 'PUT', body: JSON.stringify({ username, cookies }) }),
};
