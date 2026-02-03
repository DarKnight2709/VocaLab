import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  type ValidationPipeOptions,
} from '@nestjs/common';

/**
 * ApiValidationPipe
 *
 * Custom ValidationPipe dùng để:
 * - Chuẩn hóa validation error (422)
 * - Tự động convert type theo DTO
 * - Loại bỏ field không được khai báo trong DTO
 * - Format lỗi thân thiện và đồng nhất
 */
@Injectable()
export class ApiValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...options,

      // 1. Loại bỏ (strip) các field không có decorator validation trong DTO
      // Ví dụ DTO chỉ có 'name' -> client gửi thêm 'age' thì Nest sẽ xóa bỏ.
      whitelist: true,

      // 2. Nếu có field dư thì KHÔNG ném lỗi (false).
      // Vì bạn muốn tự xử lý: chỉ xóa nó chứ không chặn request.
      forbidNonWhitelisted: false,

      // 3. Tự động chuyển đổi kiểu theo decorator của DTO
      // Ví dụ DTO cần number -> client gửi "123" -> tự convert => 123
      transform: true,

      // 4. Bật chuyển kiểu ngầm định, không cần @Type(() => Number)
      transformOptions: {
        enableImplicitConversion: true,
      },

      // 5. Tất cả lỗi validation sẽ trả về HTTP code 422 thay vì 400 mặc định
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,

      /**
       * 6. Chuẩn hóa format lỗi trả về, theo cấu trúc thống nhất:
       * {
       *   message: 'Dữ liệu không hợp lệ',
       *   errors: [
       *     { field: 'email', messages: ['email must be an email'] }
       *   ],
       *   errorType: 'ValidationError'
       * }
       */
      exceptionFactory: (errors: ValidationError[] = []) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          messages: Object.values(error.constraints ?? []), // lấy danh sách message
        }));

        // Trả về exception 422 kèm format custom
        return new UnprocessableEntityException({
          message: 'Dữ liệu không hợp lệ',
          errors: formattedErrors,
          errorType: 'ValidationError',
        });
      },
    });
  }
}
