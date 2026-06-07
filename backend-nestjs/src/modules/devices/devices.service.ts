import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async registerDevice(userId: string, data: RegisterDeviceDto): Promise<void> {
    // Upsert to handle existing tokens or update ownership if a device changes users
    await this.prisma.userDevice.upsert({
      where: {
        fcmToken: data.fcmToken,
      },
      update: {
        userId,
      },
      create: {
        userId,
        fcmToken: data.fcmToken,
      },
    });
  }

  async unregisterDevice(userId: string, data: RegisterDeviceDto): Promise<void> {
    await this.prisma.userDevice.delete({
      where: { fcmToken: data.fcmToken, userId },
    });
  }

  async getUserDevices(userId: string): Promise<void> {
    await this.prisma.userDevice.findMany({
      where: { userId },
    });
  }
}
