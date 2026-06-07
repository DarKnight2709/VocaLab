import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a device for push notifications' })
  async register(
    @CurrentUser('id') userId: string,
    @Body() data: RegisterDeviceDto,
  ): Promise<void> {
    return this.devicesService.registerDevice(userId, data);
  }

  @Delete('unregister')
  @ApiOperation({ summary: 'Unregister a device for push notifications' })
  async unregister(
    @CurrentUser('id') userId: string,
    @Body() data: RegisterDeviceDto,
  ): Promise<void> {
    return this.devicesService.unregisterDevice(userId, data);
  }
}
