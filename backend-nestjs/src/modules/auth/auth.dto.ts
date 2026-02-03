import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  // username
  @ApiProperty({
    example: "admin",
  })
  @IsString()
  @IsNotEmpty()
  username: string;



  // password
  @ApiProperty({
    description: "Mật khẩu",
    example: "password123",
  })
  @IsString()
  @IsNotEmpty()
  password: string
}


export class LoginResponseDto {
  // token
  @ApiProperty({
    description: "Access token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  accessToken: string;



  // refresh token
  @ApiProperty({
    description: "Refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  refreshToken: string;
}



export class RefreshTokenResponseDto {
  // new access token
  @ApiProperty({
    description: "New access token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  accessToken: string;


  // new refresh token
  @ApiProperty({
    description: "New refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  refreshToken: string;
}


export class RefreshTokenDto {
  // refresh token cũ muốn làm mới 
  @ApiProperty({
    description: "New refresh token",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}


export class LogoutResponseDto {
  @ApiProperty({
    description: "Thông báo logout thành công",
    example: "Đăng xuất thành công",
  })
  message: string;
}



export class SignupDto {
  @ApiProperty({ example: 'username123' })
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}
