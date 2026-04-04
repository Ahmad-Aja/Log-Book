/**
 * Helper to replace placeholders in translation strings
 * Example: "Must be at least {min} characters" with {min: 3} -> "Must be at least 3 characters"
 */
export function interpolate(
  message: string,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    message
  );
}
