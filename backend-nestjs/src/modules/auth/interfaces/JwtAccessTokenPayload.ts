export interface JwtAccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  iat: number;
  exp: number;
}