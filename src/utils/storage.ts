/**
 * Returns the absolute URL for a stored asset path returned by the backend.
 * e.g. "uploads/public/students/foo.jpg" → "http://localhost:3000/uploads/public/students/foo.jpg"
 *
 * Strips the trailing "/api" segment from NEXT_PUBLIC_API_URL so that
 * static files served from the backend root are correctly addressed.
 */
export function getStorageUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
