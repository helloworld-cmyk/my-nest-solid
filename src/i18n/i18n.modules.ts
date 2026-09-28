import { Global, Module } from '@nestjs/common';
import { join } from 'node:path';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { DEFAULT_LANG } from './i18n.constants.js';
import { I18nTranslator } from './i18n.translator.js';
import { BodyLanguageResolver } from './resolver/bodylang.resolver.js';
@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: DEFAULT_LANG,
      loaderOptions: { path: join(__dirname, '/'), watch: true },
      resolvers: [BodyLanguageResolver, AcceptLanguageResolver],
    }),
  ],
  providers: [I18nTranslator],
  exports: [I18nModule, I18nTranslator],
})
export class I18nAppModule {}
