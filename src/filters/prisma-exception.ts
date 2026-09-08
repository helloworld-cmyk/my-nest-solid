import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
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
        message = 'Resource already exists';
        break;
      /**
       * Record không tồn tại
       * Ví dụ:
       * update/delete một User không tồn tại
       */
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
        break;

      /**
       * Foreign key constraint violation
       * Ví dụ:
       * tạo record với userId không tồn tại
       */
      case 'P2003':
        statusCode = HttpStatus.CONFLICT;
        message = 'Related resource does not exist';
        break;

      /**
       * Value quá dài so với database column
       */
      case 'P2000':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Value is too long';
        break;

      /**
       * Invalid value
       */
      case 'P2006':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid value';
        break;

      /**
       * Required field bị null
       */
      case 'P2011':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Required field cannot be null';
        break;

      /**
       * Missing required value
       */
      case 'P2012':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Required value is missing';
        break;

      /**
       * Relation violation
       */
      case 'P2014':
        statusCode = HttpStatus.CONFLICT;
        message = 'Relation constraint violation';
        break;

      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error';
    }

    response.status(statusCode).json({
      code: statusCode,
      message,
      data: null,
    });
  }
}
