import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nTranslator } from '../../i18n/i18n.translator.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly translator: I18nTranslator) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = this.translator.t('common.internalError');

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const data = exceptionResponse as {
          message?: string | string[];
        };

        message = Array.isArray(data.message)
          ? data.message[0]
          : (data.message ?? message);
      }
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}
