export const SUPPORTED_LANGS = ['en', 'vi'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'en';

export const LANG_HEADER = 'x-lang';
