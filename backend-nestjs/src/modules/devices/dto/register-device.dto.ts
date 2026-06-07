import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging (FCM) token',
    example: 'fm-token-123...',
  })
  @IsString()
  @IsNotEmpty()
  fcmToken!: string;
}