import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success?: boolean;
  data?: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((response) => {        
        if (
          response &&
          typeof response === 'object' &&
          ('data' in response)
        ) {
          return {
            success: response.success ?? true,
            data: response.data ?? null,
          };
        }

        // Raw data
        return {
          success: true,
          data: response ?? null,
        };
      }),
    );
  }
}
