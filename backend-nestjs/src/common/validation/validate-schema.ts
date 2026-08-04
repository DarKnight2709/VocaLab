import { Logger } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

export const validateWithSchema = <T>(data: unknown, schema: ZodType<T>): T => {
  try {
    const validatedData = schema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof ZodError) {
      Logger.error('Schema Validation Error', JSON.stringify({
        path: error.issues[0]?.path,
        message: error.issues[0]?.message,
        received: error.issues,
      }), 'validateWithSchema');
    }
    throw error;
  }
};
