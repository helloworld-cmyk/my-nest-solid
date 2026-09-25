import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DEFAULT_LANG } from './i18n.constants.js';

@Injectable()
export class I18nTranslator {
  constructor(private readonly i18n: I18nService) {}

  t(key: string, args?: Record<string, unknown>): string {
    const context = I18nContext.current();
    if (context) {
      return context.t(key, { args });
    }
    return this.i18n.t(key, { lang: DEFAULT_LANG, args });
  }
}
