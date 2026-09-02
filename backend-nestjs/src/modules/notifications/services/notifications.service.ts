import { map } from 'rxjs/operators';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';

import { SettingKey } from '@/common/enums/setting-key.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobNames } from '@/common/enums/email-job-names.enum';
import {
  NotificationDto,
  NotificationResponseDto,
} from '../dto/notifications-response.dto';
import { GroupChatService } from '@/modules/group-chat/group-chat.service';
import { NotificationsGateway } from '../notifications.gateway';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GroupChatService))
    private groupChatService: GroupChatService,
    private notificationsGateway: NotificationsGateway,
    @InjectQueue('email-notification') private readonly emailQueue: Queue,
  ) {}

  async createNotification(
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
        recipient: {
          select: {
            email: true,
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
      recipient: notification.recipient,
    };
  }

  async notifyActivity(params: {
    recipientId: string;
    senderId: string;
    type: NotificationType;
    content: string;
    metadata?: any;
    settingKey: SettingKey;
  }) {
    const { recipientId, senderId, type, content, metadata, settingKey } =
      params;

    // Don't notify self
    if (recipientId === senderId) return;

    // Fetch recipient's notification settings
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        email: true,
        notificationSettings: true,
      },
    });
    if (!recipient) return;

    const channel =
      recipient.notificationSettings?.[settingKey] ?? NotificationChannel.INBOX;

    if (channel === NotificationChannel.OFF) return;

    if (channel === NotificationChannel.INBOX) {
      await this.handleInboxNotification({
        recipientId,
        senderId,
        type,
        content,
        metadata,
      });
    } else if (channel === NotificationChannel.EMAIL && recipient.email) {
      await this.handleEmailNotification(recipient.email, params);
    }
  }

  async notifyBulkActivity(params: {
    recipientIds: string[];
    senderId: string;
    type: NotificationType;
    content: string;
    metadata?: any;
    settingKey: SettingKey;
  }) {
    const { recipientIds, senderId, type, content, metadata, settingKey } =
      params;
    const targetRecipientIds = recipientIds.filter((id) => id !== senderId);
    if (!targetRecipientIds.length) return;

    // 1. Fetch settings for all recipients in 1 single query
    const recipients = await this.prisma.user.findMany({
      where: { id: { in: targetRecipientIds } },
      select: {
        id: true,
        email: true,
        notificationSettings: true,
      },
    });

    const inboxRecipientIds: string[] = [];
    const emailRecipients: Array<{ email: string; id: string }> = [];

    for (const recipient of recipients) {
      const channel =
        recipient.notificationSettings?.[settingKey] ??
        NotificationChannel.INBOX;

      if (channel === NotificationChannel.OFF) continue;

      if (channel === NotificationChannel.INBOX) {
        inboxRecipientIds.push(recipient.id);
      } else if (channel === NotificationChannel.EMAIL && recipient.email) {
        emailRecipients.push({ email: recipient.email, id: recipient.id });
      }
    }

    // 2. Batch insert inbox notifications in 1 single query
    if (inboxRecipientIds.length > 0) {
      const notifications = await this.prisma.notification.createManyAndReturn({
        data: inboxRecipientIds.map((recipientId) => ({
          recipientId,
          senderId,
          type,
          content,
          metadata,
        })),
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
          recipient: {
            select: {
              email: true,
            },
          },
        },
      });

      // Emit complete NotificationDto via WebSocket (matching createNotification shape)
      for (const notif of notifications) {
        if (notif.recipientId) {
          const notificationDto = {
            id: notif.id,
            recipientId: notif.recipientId,
            groupId: null,
            groupName: null,
            senderId: notif.senderId,
            type: notif.type,
            content: notif.content,
            metadata: notif.metadata,
            isRead: notif.isRead,
            createdAt: notif.createdAt,
            sender: notif.sender,
            recipient: notif.recipient,
          };

          this.notificationsGateway.sendNotificationToUser(
            notif.recipientId,
            notificationDto as any,
          );
        }
      }
    }

    // 3. Batch enqueue emails in 1 Redis operation (only queries sender if emails exist)
    if (emailRecipients.length > 0) {
      const [sender, blogContext] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: senderId },
          select: { fullName: true, username: true },
        }),
        (type === NotificationType.COMMENT ||
          type === NotificationType.UPVOTE ||
          type === NotificationType.NEW_BLOG_POST) &&
        metadata?.blogId
          ? this.prisma.blog.findUnique({
              where: { id: metadata.blogId },
              select: { title: true },
            })
          : null,
      ]);

      const senderName = sender?.fullName || sender?.username;
      const { activityType, jobName } = this.getEmailDetails(type, metadata);

      await this.emailQueue.addBulk(
        emailRecipients.map((rec) => ({
          name: jobName,
          data: {
            recipientEmail: rec.email,
            senderName,
            senderUsername: sender?.username,
            activityType,
            content,
            postTitle: blogContext?.title,
            blogId: metadata?.blogId,
          },
          opts: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
          },
        })),
      );
    }
  }

  private async handleInboxNotification(data: {
    recipientId: string;
    senderId: string;
    type: NotificationType;
    content: string;
    metadata?: any;
  }) {
    const notification = await this.createNotification(data);
    this.notificationsGateway.sendNotificationToUser(
      data.recipientId,
      notification,
    );
  }

  private async handleEmailNotification(
    recipientEmail: string,
    params: {
      senderId: string;
      type: NotificationType;
      content: string;
      metadata?: any;
    },
  ) {
    const { senderId, type, content, metadata } = params;

    // Fetch sender and context data in parallel to save database roundtrip time
    const [sender, blogContext] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: senderId },
        select: { fullName: true, username: true },
      }),
      (type === NotificationType.COMMENT ||
        type === NotificationType.UPVOTE ||
        type === NotificationType.NEW_BLOG_POST) &&
      metadata?.blogId
        ? this.prisma.blog.findUnique({
            where: { id: metadata.blogId },
            select: { title: true },
          })
        : null,
    ]);

    const senderName = sender?.fullName || sender?.username;
    const { activityType, jobName } = this.getEmailDetails(type, metadata);

    // Queue the email job
    await this.emailQueue.add(
      jobName,
      {
        recipientEmail,
        senderName,
        senderUsername: sender?.username,
        activityType,
        content,
        postTitle: blogContext?.title,
        blogId: metadata?.blogId,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<NotificationResponseDto> {
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
            not: userId,
          },
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
          recipient: {
            select: {
              email: true,
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
            not: userId,
          },
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
          not: userId,
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
            not: userId,
          },
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
          not: userId,
        },
      },
      data: { isRead: true },
    });
  }

  // Helpers

  private getEmailDetails(type: NotificationType, metadata: any) {
    if (type === NotificationType.COMMENT) {
      const isReply = !!metadata?.parentCommentId;
      return {
        activityType: isReply
          ? 'replied to your comment'
          : 'commented on your post',
        jobName: isReply
          ? EmailJobNames.REPLY_ON_COMMENT_EMAIL
          : EmailJobNames.COMMENT_ON_POST_EMAIL,
      };
    }

    if (type === NotificationType.UPVOTE) {
      const isCommentVote = !!metadata?.commentId;
      return {
        activityType: isCommentVote ? 'liked your comment' : 'liked your post',
        jobName: isCommentVote
          ? EmailJobNames.UPVOTE_ON_COMMENT_EMAIL
          : EmailJobNames.UPVOTE_ON_POST_EMAIL,
      };
    }

    if (type === NotificationType.FOLLOW) {
      return {
        activityType: 'started following you',
        jobName: EmailJobNames.NEW_FOLLOWER_EMAIL,
      };
    }

    if (type === NotificationType.NEW_BLOG_POST) {
      return {
        activityType: 'posted new content',
        jobName: EmailJobNames.NEW_BLOG_POST_EMAIL,
      };
    }

    // Default fallback values
    return {
      activityType: 'active on VocaLab',
      jobName: EmailJobNames.COMMENT_ON_POST_EMAIL,
    };
  }
}
