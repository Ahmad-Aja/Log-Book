// Should export as an array
export const locales = ["ar", "en"] as const; // or however many you have
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];
