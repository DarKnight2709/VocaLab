import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

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
