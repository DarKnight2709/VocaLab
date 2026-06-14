import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialPlatform } from '@prisma/client';

export class CreateUserDto {
  // username
  @ApiProperty({
    description: 'username',
    example: 'quyentran',
  })
  @IsNotEmpty()
  @IsString()
  username!: string;

  // hashedPassword
  @ApiProperty({
    description: 'mật khẩu',
    example: 'quyentran123',
  })
  @IsNotEmpty()
  @IsString()
  hashedPassword!: string;

  // fullname
  @ApiProperty({
    description: 'Họ và tên đầy đủ',
    example: 'Trần Duy Quyến',
  })
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  // email
  @ApiProperty({
    description: 'Email',
    example: 'nguyenvana@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email!: string;
}

export class UpdatePersonalInfoDto {
  @ApiProperty({ example: 'username123', required: false })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
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

// response dto chỉ cần đơn giản vậy.
// nếu muốn nâng cấp có thể dùng @Expose(), @Exclude(), @Transform()
// Lúc đó:
// - phải dùng plainToInstance
// - ClassSerializerInterceptor mới có ý nghĩa
export class UpdatePersonalInfoResponseDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  fullName!: string;

  @ApiProperty({ example: '[EMAIL_ADDRESS]' })
  email!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar?: string | null;
}


export class CreateUserSocialDto {
  @ApiProperty({ enum: SocialPlatform, example: SocialPlatform.FACEBOOK })
  @IsEnum(SocialPlatform)
  @IsNotEmpty()
  platform!: SocialPlatform;

  @ApiProperty({ example: 'My Facebook', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'https://facebook.com/myprofile' })
  @IsUrl()
  @IsNotEmpty()
  link!: string;
}