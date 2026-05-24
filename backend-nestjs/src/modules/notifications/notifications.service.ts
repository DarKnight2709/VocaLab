import { map } from 'rxjs/operators';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { NotificationType } from '@prisma/client';
import {
  GetNotificationResponseDto,
  NotificationDto,
} from './dto/notifications-response.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GroupChatService } from '../group-chat/group-chat.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GroupChatService))
    private groupChatService: GroupChatService,
  ) {}

  async createChatNotification(
    data: CreateNotificationDto,
  ): Promise<NotificationDto> {
    const isGroup = data.type === NotificationType.CHAT_GROUP;
    const notification = await this.prisma.notification.create({
      data: {
        groupId: isGroup ? data.groupId : undefined,
        recipientId: isGroup ? undefined : data.recipientId,
        senderId: data.senderId,
        type: data.type,
        content: data.content,
        metadata: data.metadata,
      },
      select: {
        id: true,
        recipientId: true,
        groupId: true,
        senderId: true,
        type: true,
        content: true,
        metadata: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: notification.id,
      recipientId: notification.recipientId,
      groupId: notification.groupId,
      groupName: notification.group?.name || null,
      senderId: notification.senderId,
      type: notification.type,
      content: notification.content,
      metadata: notification.metadata,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      sender: notification.sender,
    };
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<GetNotificationResponseDto> {
    const skip = (page - 1) * limit;

    // get groups to which the user belong
    const groupIds = (await this.groupChatService.findUserGroups(userId)).map(
      (g) => g.id,
    );

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          OR: [{ recipientId: userId }, { groupId: { in: groupIds } }],
          senderId: {
            not: userId
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          group: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: {
          OR: [{ recipientId: userId }, { groupId: { in: groupIds } }],
          senderId: {
            not: userId
          }
        },
      }),
    ]);
    return {
      notifications: notifications.map(({ group, ...n }) => ({
        ...n,
        groupName: group?.name || null,
      })),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const groupIds = (await this.groupChatService.findUserGroups(userId)).map(
      (g) => g.id,
    );
    const count = await this.prisma.notification.count({
      where: {
        OR: [{ recipientId: userId }, { groupId: { in: groupIds } }],
        senderId: {
          not: userId
        },
        isRead: false,
      },
    });
    return count;
  }

  async markAsRead(userId: string, notificationId?: string): Promise<void> {
    const groupIds = (await this.groupChatService.findUserGroups(userId)).map(
      (g) => g.id,
    );

    // Case 1: Mark a single notification as read
    if (notificationId) {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          isRead: false,
          OR: [{ recipientId: userId }, { groupId: { in: groupIds } }],
          senderId: {
            not: userId
          }
        },
        data: { isRead: true },
      });
      return;
    }

    // Case 2: Bulk mark ALL user's notifications as read
    await this.prisma.notification.updateMany({
      where: {
        isRead: false,
        OR: [{ recipientId: userId }, { groupId: { in: groupIds } }],
        senderId: {
          not: userId
        }
      },
      data: { isRead: true },
    });
  }
}
