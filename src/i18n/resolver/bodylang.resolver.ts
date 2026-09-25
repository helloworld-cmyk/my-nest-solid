import { ExecutionContext, Injectable } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';

interface RequestBodyWithLang {
  body?: {
    metadata?: { lang?: string };
    lang?: string;
  };
}

@Injectable()
export class BodyLanguageResolver implements I18nResolver {
  resolve(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<RequestBodyWithLang>();
    const body = request?.body;

    return body?.metadata?.lang;
  }
}
