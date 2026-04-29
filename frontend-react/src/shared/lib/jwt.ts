import { jwtDecode } from "jwt-decode";

export type DecodedJwtToken = {
  sub: string;
  username: string;
  iat: number;
  exp: number;
  // roles: string[];
};

export const decodeToken = (token: string) => {
  try {
    return jwtDecode(token) as DecodedJwtToken;
  } catch (error) {
    return null;
  }
};
