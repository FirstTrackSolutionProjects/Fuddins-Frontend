export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';
export const API_BASE_URL = `${API_ORIGIN}/api`;

export function resolveAssetUrl(path?: string | null) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Files in Vite's public directory are served by the frontend host itself.
  if (path.startsWith('/images/')) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
