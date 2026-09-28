import { DEFAULT_LANG } from '../../i18n/i18n.constants.js';

export function pickTranslation<T extends { languageCode: string }>(
  translations: readonly T[] | undefined | null,
  lang: string = DEFAULT_LANG,
): T | undefined {
  if (!translations || translations.length === 0) {
    return undefined;
  }
  return (
    translations.find((t) => t.languageCode === lang) ??
    translations.find((t) => t.languageCode === DEFAULT_LANG) ??
    translations[0]
  );
}
