import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    Logger.error(exception);

    // 🔥 Convert Prisma errors to HttpException first
    exception = this.handlePrismaException(exception);

    const apiResponse = ApiExceptionFilter.handleException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(exception?.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR)
      .json(apiResponse);
  }

  private handlePrismaException(exception: any) {
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

  static handleException(exception: HttpException) {
    const message = exception?.message ?? 'Lỗi không xác định';

    let responseDto = {
      message,
      errors: undefined,
    };

    const exceptionResponse =
      exception instanceof HttpException ? exception?.getResponse() : null;

    if (typeof exceptionResponse === 'object') {
      if (exception?.getStatus() === HttpStatus.UNPROCESSABLE_ENTITY) {
        responseDto = {
          ...responseDto,
          ...exceptionResponse,
        };
      }
    }

    return responseDto;
  }
}
