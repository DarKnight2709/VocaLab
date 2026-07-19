import { Request } from 'express';

export interface RequestUser {
  id: string,
  email: string,
  fullName: string,
  username: string,
  avatar: string | null,
}

export interface IRequest extends Request {
  user: RequestUser
}

export interface IRouteInfo {
  module: string;
  controller: string;
  method: string;
  path: string;
  handler: string;
}
