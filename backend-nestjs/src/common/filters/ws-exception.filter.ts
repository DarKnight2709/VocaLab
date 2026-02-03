import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    if (exception instanceof WsException) {
      // Validation error: log less verbose
       Logger.warn(`WsException: ${JSON.stringify(exception.getError())}`, 'WsExceptionFilter');
    } else {
       Logger.error(exception, 'WsExceptionFilter');
    }
    let errorResponse: any = {
      status: 'error',
      message: 'Internal server error',
    };

    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'object') {
        errorResponse = {
          status: 'error',
          ...error,
        };
      } else {
        errorResponse.message = error;
      }
    } else if (exception instanceof Error) {
      errorResponse.message = exception.message; // Use specific error message
    }

    // Handle acknowledgment callback if present (Socket.io pattern)
    const callback = host.getArgByIndex(2);
    if (callback && typeof callback === 'function') {
      callback(errorResponse);
    } else {
      // Standard event emission
      client.emit('exception', errorResponse);
    }
  }
}
