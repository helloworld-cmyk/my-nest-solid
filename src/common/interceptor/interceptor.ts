import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nTranslator } from '../../i18n/i18n.translator.js';

export interface BaseResponse<T> {
  code: number;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  BaseResponse<T>
> {
  constructor(private readonly translator: I18nTranslator) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        data,
        message: this.translator.t('common.success'),
      })),
    );
  }
}
