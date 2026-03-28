export type Lang = "en" | "he" | "ar" | "fr" | "es" | "de" | "ru" | "zh" | "pt" | "tr" | "it" | "ja" | "ko" | "hi" | "nl";

export const LANGUAGES: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "he", label: "עברית", dir: "rtl" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "zh", label: "中文", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
];
