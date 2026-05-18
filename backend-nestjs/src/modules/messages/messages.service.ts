import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UserService } from '../users/users.service';
import { MessageStatus, MessageType, VisibilityScope } from '@prisma/client';
import { ErrorCode } from '@/common/enums/error-code.enum';
import {
  MessageAttachment,
  MessageWithDetails,
  ConversationListItem,
  UserBasicInfo,
} from './messages.types';

export interface SendMessageInput {
  senderId: string;
  receiverId?: string;
  type: MessageType;
  groupId?: string;
  content?: string;
  replyTo?: string;
  attachments?: MessageAttachment[];
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getConversations(
    userId: string,
  ): Promise<{ users: ConversationListItem[] }> {
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
        privacySettings: {
          select: {
            messageScope: true,
          },
        },
      },
    });

    // 2. Fetch all follows to determine friendship
    const follows = await this.prisma.follow.findMany({
      where: {
        OR: [{ followerId: userId }, { followingId: userId }],
      },
    });

    const followingIds = new Set(
      follows.filter((f) => f.followerId === userId).map((f) => f.followingId),
    );
    const followerIds = new Set(
      follows.filter((f) => f.followingId === userId).map((f) => f.followerId),
    );

    // 3. Get all direct messages for this user to calculate lastMessage and unreadCount
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

    // 4. Process messages to find last message and unread count per user
    const statsMap = new Map<
      string,
      { lastMessage: any; unreadCount: number }
    >();
    for (const msg of messages) {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!otherUserId) continue;

      if (!statsMap.has(otherUserId)) {
        statsMap.set(otherUserId, {
          lastMessage: {
            content: msg.content ?? undefined,
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
        stats!.unreadCount++;
      }
    }

    // 5. Combine all users with their stats and privacy capabilities
    const users = allUsers.map((user) => {
      const stats = statsMap.get(user.id) || {
        lastMessage: null,
        unreadCount: 0,
      };

      const isFriend = followingIds.has(user.id) && followerIds.has(user.id);
      const scope = user.privacySettings?.messageScope ?? VisibilityScope.EVERYONE;

      let canChat = true;
      if (scope === VisibilityScope.PRIVATE) {
        canChat = false;
      } else if (scope === VisibilityScope.FRIENDS) {
        canChat = isFriend;
      }

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName ?? undefined,
        avatar: user.avatar ?? undefined,
        email: user.email ?? undefined,
        canChat,
        ...stats,
      } as ConversationListItem;
    });

    // Sort by last message time (users with messages first)
    const sortedUsers = users.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return timeB - timeA;
    });

    return { users: sortedUsers };
  }

  async getMessages(
    userId: string,
    friendId: string,
  ): Promise<{ messages: MessageWithDetails[] }> {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
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

    const mapped = messages.map((m) => {
      return {
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId ?? undefined,
        groupId: m.groupId ?? undefined,
        content: m.content ?? undefined,
        replyTo: m.replyToId ?? undefined,
        attachments: Array.isArray(m.attachments)
          ? (m.attachments as unknown as MessageAttachment[])
          : undefined,
        status: m.status,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        sender: m.sender as UserBasicInfo,
        receiver: m.receiver as UserBasicInfo,
        seenBy: m.seenBy.map((item: any) => item.user) ?? [],
      } as MessageWithDetails;
    });

    return { messages: mapped };
  }

  async sendMessage(input: SendMessageInput) {
    const isDirect = input.type === MessageType.DIRECT;

    if (isDirect) {
      if (!input.receiverId) {
        throw new BadRequestException(ErrorCode.RECEIVER_ID_REQUIRED);
      }
      const allowed = await this.canChat(input.senderId, input.receiverId);
      if (!allowed) {
        throw new BadRequestException(ErrorCode.CANNOT_CHAT_WITH_USER);
      }
    } else {
      if (!input.groupId) {
        throw new BadRequestException(ErrorCode.GROUP_ID_REQUIRED);
      }
    }

    // Validate content or attachments
    const hasContent = !!input.content?.trim();
    const hasAttachments = !!(input.attachments && input.attachments.length > 0);
    if (!hasContent && !hasAttachments) {
      throw new BadRequestException(ErrorCode.MESSAGE_CONTENT_OR_ATTACHMENTS_REQUIRED);
    }

    // Convert Attachments to plain JSON
    const attachmentsJson = input.attachments
      ? JSON.parse(JSON.stringify(input.attachments))
      : null;

    const message = await this.prisma.message.create({
      data: {
        senderId: input.senderId,
        receiverId: input.receiverId,
        groupId: input.groupId,
        type: input.type,
        content: input.content?.trim(),
        replyToId: input.replyTo,
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

    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId ?? undefined,
      groupId: message.groupId ?? undefined,
      content: message.content ?? undefined,
      replyTo: message.replyToId ?? undefined,
      attachments: Array.isArray(message.attachments)
        ? (message.attachments as unknown as MessageAttachment[])
        : undefined,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: message.sender
        ? {
            id: message.sender.id,
            username: message.sender.username,
            fullName: message.sender.fullName ?? undefined,
            avatar: message.sender.avatar ?? undefined,
          }
        : undefined,
      seenBy: message.seenBy.map((seen: any) => {
        const u = seen.user || seen;
        return {
          id: u.id || seen.userId,
          username: u.username,
          fullName: u.fullName,
          avatar: u.avatar,
        };
      }),
    };
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
    return { message: 'Message status updated successfully' };
  }

  async markAsSeen(senderId: string, receiverId: string) {
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

  async markGroupAsSeen(groupId: string, userId: string) {
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

  // --- Group-Chat Support Methods ---
  async findLastGroupMessage(groupId: string): Promise<MessageWithDetails | null> {
    const message = await this.prisma.message.findFirst({
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

    if (!message) return null;

    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId ?? undefined,
      groupId: message.groupId ?? undefined,
      content: message.content ?? undefined,
      replyTo: message.replyToId ?? undefined,
      attachments: Array.isArray(message.attachments)
        ? (message.attachments as unknown as MessageAttachment[])
        : undefined,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: message.sender as UserBasicInfo,
      seenBy: message.seenBy.map((m) => m.user) ?? [],
    } as MessageWithDetails;
  }

  async countUnreadGroupMessages(groupId: string, userId: string): Promise<number> {
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

  async findGroupMessages(groupId: string): Promise<MessageWithDetails[]> {
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

    return messages.map((m) => {
      return {
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId ?? undefined,
        groupId: m.groupId ?? undefined,
        content: m.content ?? undefined,
        replyTo: m.replyToId ?? undefined,
        attachments: Array.isArray(m.attachments)
          ? (m.attachments as unknown as MessageAttachment[])
          : undefined,
        status: m.status,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        sender: m.sender as UserBasicInfo,
        seenBy: m.seenBy.map((m) => m.user) ?? [],
      } as MessageWithDetails;
    });
  }

  async canChat(senderId: string, receiverId: string): Promise<boolean> {
    const privacy = await this.prisma.userPrivacySetting.findUnique({
      where: { userId: receiverId },
    });
    const messageScope = privacy?.messageScope ?? 'EVERYONE';

    if (messageScope === VisibilityScope.EVERYONE) return true;
    if (messageScope === VisibilityScope.PRIVATE) return false;

    if (messageScope === VisibilityScope.FRIENDS) {
      return this.userService.checkFriendship(senderId, receiverId);
    }

    return true;
  }
}
