import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma/client.js';
import { Response } from 'express';
import { I18nTranslator } from '../../i18n/i18n.translator.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  constructor(private readonly translator: I18nTranslator) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let statusCode: HttpStatus;
    let message: string;

    switch (exception.code) {
      /**
       * Unique constraint violation
       * Ví dụ:
       * email đã tồn tại
       */
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        message = this.translator.t('common.resourceAlreadyExists');
        break;
      /**
       * Record không tồn tại
       * Ví dụ:
       * update/delete một User không tồn tại
       */
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = this.translator.t('common.resourceNotFound');
        break;

      /**
       * Foreign key constraint violation
       * Ví dụ:
       * tạo record với userId không tồn tại
       */
      case 'P2003':
        statusCode = HttpStatus.CONFLICT;
        message = this.translator.t('common.relatedNotFound');
        break;

      /**
       * Value quá dài so với database column
       */
      case 'P2000':
        statusCode = HttpStatus.BAD_REQUEST;
        message = this.translator.t('common.valueTooLong');
        break;

      /**
       * Invalid value
       */
      case 'P2006':
        statusCode = HttpStatus.BAD_REQUEST;
        message = this.translator.t('common.invalidValue');
        break;

      /**
       * Required field bị null
       */
      case 'P2011':
        statusCode = HttpStatus.BAD_REQUEST;
        message = this.translator.t('common.requiredNotNull');
        break;

      /**
       * Missing required value
       */
      case 'P2012':
        statusCode = HttpStatus.BAD_REQUEST;
        message = this.translator.t('common.requiredMissing');
        break;

      /**
       * Relation violation
       */
      case 'P2014':
        statusCode = HttpStatus.CONFLICT;
        message = this.translator.t('common.relationViolation');
        break;

      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = this.translator.t('common.databaseError');
    }

    response.status(statusCode).json({
      code: statusCode,
      message,
      data: null,
    });
  }
}
