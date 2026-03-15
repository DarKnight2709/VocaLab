import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((response) => {
        // Extract message if it exists in the response object
        const message = response?.message || 'Thao tác thành công';
        
        let data = response;
        // If the response is an object, we might want to extract the actual data part
        // such as { message: "...", user: { ... } } -> we want user to be the data
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          const { message: _, success: __, ...rest } = response;
          // If there's nothing left but message/success, data is null
          if (Object.keys(rest).length === 0) {
            data = {};
          } else {
            // Keep the structure as defined in the controller
            data = rest;
          }
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}

