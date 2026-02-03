import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {
  // username
  @ApiProperty({
    description: "username",
    example: "quyentran",
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  // hashedPassword
  @ApiProperty({
    description: "mật khẩu",
    example: "quyentran123",
  })
  @IsNotEmpty()
  @IsString()
  hashedPassword: string;

  // fullname
  @ApiProperty({
    description: "Họ và tên đầy đủ",
    example: "Trần Duy Quyến",
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;


  // email
  @ApiProperty({
    description: 'Email',
    example: 'nguyenvana@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email: string;
}

export class UpdatePersonalInfoDto {
  @ApiProperty({ example: 'username123', required: false })
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;
}
