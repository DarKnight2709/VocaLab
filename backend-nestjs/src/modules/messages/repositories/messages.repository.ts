import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { MessageEntity } from '../domain/message.entity';
import { MessagesRepositoryInterface } from '../domain/interfaces/messages-repository.interface';
import { MessageType } from '@prisma/client';
import { MessageAttachment } from '../domain/types/message-attachment.type';

@Injectable()
export class MessagesRepository implements MessagesRepositoryInterface {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    senderId: string;
    receiverId?: string;
    type: MessageType;
    groupId?: string;
    content?: string;
    replyTo?: string;
    attachments?: MessageAttachment[];
  }): Promise<MessageEntity> {
    const { replyTo, attachments, ...prismaData } = data;

    // Convert MessageAttachment[] to plain JSON for Prisma
    const attachmentsJson = attachments
      ? JSON.parse(JSON.stringify(attachments))
      : null;

    const message = await this.prisma.message.create({
      data: {
        ...prismaData,
        replyToId: replyTo,
        attachments: attachmentsJson,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return new MessageEntity({
      ...message,
      receiverId: message.receiverId ?? undefined,
      groupId: message.groupId ?? undefined,
      content: message.content ?? undefined,
      replyTo: message.replyToId ?? undefined,
      attachments: Array.isArray(message.attachments)
        ? (message.attachments as unknown as MessageAttachment[])
        : undefined,
      sender: message.sender ? {
        id: message.sender.id,
        username: message.sender.username,
        fullName: message.sender.fullName ?? undefined,
        avatar: message.sender.avatar ?? undefined,
      } : undefined,
      seenBy: message.seenBy.map((seen: any) => {
        const u = seen.user || seen;
        return {
          id: u.id || seen.userId,
          username: u.username,
          fullName: u.fullName,
          avatar: u.avatar,
        };
      }),
    });
  }

  async findDirectMessages(userId1: string, userId2: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        groupId: null, // Ensure it's 1-1
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return messages.map(m => ({
      ...m,
      seenBy: m.seenBy.map(seen => ({
        id: seen.user.id,
        username: seen.user.username,
        fullName: seen.user.fullName,
        avatar: seen.user.avatar
      }))
    }));
  }

  async findGroupMessages(groupId: string) {
    const messages = await this.prisma.message.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return messages.map(m => ({
      ...m,
      seenBy: m.seenBy.map(seen => ({
        id: seen.user.id,
        username: seen.user.username,
        fullName: seen.user.fullName,
        avatar: seen.user.avatar
      }))
    }));
  }

  async findLastGroupMessage(groupId: string) {
    return this.prisma.message.findFirst({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async countUnreadGroupMessages(groupId: string, userId: string) {
    return this.prisma.message.count({
      where: {
        groupId,
        senderId: { not: userId },
        seenBy: {
          none: { userId },
        },
      },
    });
  }

  async markDirectMessagesAsSeen(senderId: string, receiverId: string) {
    // Find messages that need to be marked as seen
    const messages = await this.prisma.message.findMany({
      where: {
        senderId,
        receiverId,
        seenBy: {
          none: { userId: receiverId },
        },
      },
      select: { id: true },
    });

    // Update each message
    const results = await Promise.all(
      messages.map((msg) =>
        this.prisma.message.update({
          where: { id: msg.id },
          data: {
            seenBy: {
              create: {
                userId: receiverId,
              },
            },
          },
        }),
      ),
    );

    return { count: results.length };
  }

  async markGroupMessagesAsSeen(groupId: string, userId: string) {
    // Find messages that need to be marked as seen
    const messages = await this.prisma.message.findMany({
      where: {
        groupId,
        senderId: { not: userId },
        seenBy: {
          none: { userId: userId },
        },
      },
      select: { id: true },
    });

    // Update each message
    const results = await Promise.all(
      messages.map((msg) =>
        this.prisma.message.update({
          where: { id: msg.id },
          data: {
            seenBy: {
              create: {
                userId: userId,
              },
            },
          },
        }),
      ),
    );

    return { count: results.length };
  }

  async getConversations(userId: string) {
    // 1. Get all users (except self)
    const allUsers = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
      },
    });

    // 2. Get all direct messages for this user to calculate lastMessage and unreadCount
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        groupId: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        seenBy: {
          select: {
            userId: true,
          },
        },
      },
    });

    // 3. Process messages to find last message and unread count per user
    const statsMap = new Map();
    for (const msg of messages) {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!otherUserId) continue;

      if (!statsMap.has(otherUserId)) {
        statsMap.set(otherUserId, {
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isMine: msg.senderId === userId,
          },
          unreadCount: 0,
        });
      }

      const stats = statsMap.get(otherUserId);
      if (
        msg.receiverId === userId &&
        !msg.seenBy.some((s) => s.userId === userId)
      ) {
        stats.unreadCount++;
      }
    }

    // 4. Combine all users with their stats
    const result = allUsers.map((user) => {
      const stats = statsMap.get(user.id) || {
        lastMessage: null,
        unreadCount: 0,
      };
      return {
        ...user,
        ...stats,
      };
    });

    // Sort by last message time (users with messages first)
    return result.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return timeB - timeA;
    });
  }
}
