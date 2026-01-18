import { jwtDecode } from 'jwt-decode'

export type DecodedJwtToken = {
  iat: number
  exp: number
  sub: string
  roles: string[]
  username: string
}

export const decodeToken = (token: string) => {
  try {
    // giải mã phần payload mà jwt token (không cần verify chữ kí)
    // dùng với try catch để biết token có sai định dạng, hết hết, bị sửa thì trả về null
    return jwtDecode(token) as DecodedJwtToken
  } catch (error) {
    return null
  }
}
