import { ZodError, ZodType } from 'zod';

export const validateWithSchema = <T>(data: unknown, schema: ZodType<T>): T => {
  try {
    const validatedData = schema.parse(data);
    return validatedData;
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('❌ Schema Validation Error:', {
        path: error.issues[0]?.path,
        message: error.issues[0]?.message,
        received: error.issues,
        data,
      });
    }
    throw error;
  }
};
