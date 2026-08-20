import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AuthTokensDto {
  // token
  @ApiProperty({
    description: "Access token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  @Expose()
  accessToken!: string;

  // refresh token
  @ApiProperty({
    description: "Refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  @Expose()
  refreshToken!: string;
}

export class TempTokenResponseDto {
  @ApiProperty({
    description: "Temp token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  @Expose()
  tempToken!: string;
}
export class TwoFactorGenerateResponseDto {
  @ApiProperty({
    description: "Mã QR code cho 2FA",
    example: "data:image/png;base64,iVBORw0KGgo...",
  })
  @Expose()
  qrCode!: string;
}

