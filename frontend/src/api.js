const BASE = import.meta.env.VITE_API_URL || '/api';

export const token = {
  get: () => localStorage.getItem('th_token'),
  set: (t) => localStorage.setItem('th_token', t),
  clear: () => localStorage.removeItem('th_token'),
};

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token.get() ? { Authorization: `Bearer ${token.get()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && !path.startsWith('/auth')) {
    token.clear();
    localStorage.removeItem('th_user');
    window.location.href = '/login';
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Something went wrong. Try again.');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};
