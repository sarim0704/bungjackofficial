const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof data === 'object'
        ? data.error || data.message || 'Request failed'
        : data || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include' });
  return parseResponse(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function apiPatch(path, body = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return parseResponse(res);
}

/**
 * Upload a single image file to /api/uploads/image (Cloudinary).
 * Requires admin session cookie.
 * Returns { url: string }
 */
export async function apiUpload(file) {
  if (!(file instanceof File)) throw new Error('Invalid file.');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');
  if (file.size > 3 * 1024 * 1024) throw new Error('Image must be under 3 MB.');

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/uploads/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return parseResponse(res);
}

export { API_URL };
