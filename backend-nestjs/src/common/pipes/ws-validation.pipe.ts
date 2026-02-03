// src/common/pipes/ws-validation.pipe.ts
import { ValidationPipe, ValidationError } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class WsValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map(err => ({
          field: err.property,
          messages: Object.values(err.constraints ?? []),
        }));

        return new WsException({
          message: 'Dữ liệu không hợp lệ',
          errors: formattedErrors,
          errorType: 'ValidationError',
        });
      },
    });
  }
}
