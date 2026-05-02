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

    let message = 'Internal server error';
    let errors: any = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
      const res: any = exceptionResponse;

      if (Array.isArray(res?.message)) {
        errors = res.message;
        message = 'Validation failed';
      } else {
        message = res?.message || (transformedException as any).message;
      }

      if (res?.errors) {
        errors = res.errors;
      }
    }

    Logger.error((transformedException as any).message, 'ApiExceptionFilter');

    let resData: any = {};
    if (typeof exceptionResponse === 'object' && exceptionResponse) {
      resData = exceptionResponse;
    }

    response.status(status).json({
      success: false,
      message,
      errors,
      ...resData,
      path: request.url,
    });
  }

  private handlePrismaException(exception: unknown) {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025':
          return new HttpException('Record not found', HttpStatus.NOT_FOUND);
        case 'P2002':
          return new HttpException('Duplicate value', HttpStatus.CONFLICT);
        case 'P2003':
          return new HttpException(
            'Foreign key constraint failed',
            HttpStatus.BAD_REQUEST,
          );
        case 'P2021':
          return new HttpException(
            'Table does not exist',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        default:
          return new HttpException(
            'Database error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return new HttpException('Invalid query data', HttpStatus.BAD_REQUEST);
    }

    return exception;
  }
}
