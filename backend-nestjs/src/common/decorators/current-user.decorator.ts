import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequest } from '../types';

export type CurrentUserType = IRequest['user'];

export const CurrentUser = createParamDecorator<
  keyof CurrentUserType | undefined
>(
  (
    field: keyof CurrentUserType | undefined,
    ctx: ExecutionContext,
  ): CurrentUserType | CurrentUserType[keyof CurrentUserType] | undefined => {
    const request = ctx.switchToHttp().getRequest<IRequest>();
    return field ? request.user?.[field] : request.user;
  },
);
