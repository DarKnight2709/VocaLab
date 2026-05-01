import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { SocialPlatform } from '@prisma/client';

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
