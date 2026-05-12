import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: "user@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  // password
  @ApiProperty({
    description: "Mật khẩu",
    example: "password123",
  })
  @IsString()
  @IsNotEmpty()
  password!: string
}


export class LoginResponseDto {
  // token
  @ApiProperty({
    description: "Access token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  accessToken!: string;

  // refresh token
  @ApiProperty({
    description: "Refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  refreshToken!: string;
}

export class TempTokenResponseDto {
  @ApiProperty({
    description: "Temp token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  tempToken!: string;
}

export class TwoFactorLoginDto {
  @ApiProperty({
    description: "Temp token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @ApiProperty({
    description: "Mã OTP (6 chữ số)",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}



export class RefreshTokenResponseDto {
  // new access token
  @ApiProperty({
    description: "New access token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  accessToken!: string;


  // new refresh token
  @ApiProperty({
    description: "New refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  refreshToken!: string;
}


export class RefreshTokenDto {
  // refresh token cũ muốn làm mới 
  @ApiProperty({
    description: "New refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}



export class SignupDto {
  @ApiProperty({ example: 'username123' })
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}


export class SetPasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123' })
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class TwoFactorGenerateResponseDto {
  @ApiProperty({
    description: "Mã QR code cho 2FA",
    example: "data:image/png;base64,iVBORw0KGgo...",
  })
  qrCode!: string;
}

export class TwoFactorVerifyDto {
  @ApiProperty({
    description: "Mã OTP (6 chữ số)",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}

