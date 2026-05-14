import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../enums/error-code.enum';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const transformedException = this.handlePrismaException(exception);

    const status =
      transformedException instanceof HttpException
        ? transformedException.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      transformedException instanceof HttpException
        ? transformedException.getResponse()
        : null;

    let message = ErrorCode.INTERNAL_SERVER_ERROR;
    let errors: any = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse as any;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
      const res: any = exceptionResponse;

      if (Array.isArray(res?.message)) {
        errors = res.message;
        message = ErrorCode.VALIDATION_FAILED;
      } else {
        message = res?.message || (transformedException as any).message;
      }

      if (res?.errors) {
        errors = res.errors;
      }
    }

    Logger.error((transformedException as any).message, 'ApiExceptionFilter');

    response.status(status).json({
      success: false,
      message,
      errors,
      path: request.url,
    });
  }

  private handlePrismaException(exception: unknown) {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025':
          return new HttpException(ErrorCode.RECORD_NOT_FOUND, HttpStatus.NOT_FOUND);
        case 'P2002':
          return new HttpException(ErrorCode.DUPLICATE_VALUE, HttpStatus.CONFLICT);
        case 'P2003':
          return new HttpException(
            ErrorCode.FOREIGN_KEY_FAILED,
            HttpStatus.BAD_REQUEST,
          );
        case 'P2021':
          return new HttpException(
            ErrorCode.DATABASE_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        default:
          return new HttpException(
            ErrorCode.DATABASE_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return new HttpException(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }

    return exception;
  }
}
