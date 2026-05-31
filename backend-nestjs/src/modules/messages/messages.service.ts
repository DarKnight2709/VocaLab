import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UserService } from '../users/users.service';
import { MessageStatus, MessageType, VisibilityScope } from '@prisma/client';
import { ErrorCode } from '@/common/enums/error-code.enum';
import {
  MessageAttachment,
  MessageWithDetails,
  GetConversationsResponseDto,
  GetMessagesResponseDto,
  LastMessageInfo,
} from './dto/messages-response.dto';
import { MessageAttachmentDto } from './dto/messages.dto';

export interface SendMessageInput {
  senderId: string;
  receiverId?: string;
  type: MessageType;
  groupId?: string;
  content?: string;
  replyTo?: string;
  attachments?: MessageAttachmentDto[];
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getConversations(userId: string): Promise<GetConversationsResponseDto> {
    // Find all blocks where current userId is the blocked user
    const blockRelations = await this.prisma.block.findMany({
      where: {
        blockedId: userId,
      },
      select: {
        blockingId: true,
      },
    });

    const blockerUserIds = blockRelations.map((r) => r.blockingId);

    // 1. Get all users (except self and blockers)
    const allUsers = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: [userId, ...blockerUserIds],
        },
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
      { lastMessage: LastMessageInfo; unreadCount: number }
    >();
    for (const msg of messages) {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!otherUserId) continue;

      if (!statsMap.has(otherUserId)) {
        statsMap.set(otherUserId, {
          lastMessage: {
            content: msg.content ?? null,
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
      const scope =
        user.privacySettings?.messageScope ?? VisibilityScope.EVERYONE;

      let canChat = true;
      if (scope === VisibilityScope.PRIVATE) {
        canChat = false;
      } else if (scope === VisibilityScope.FRIENDS) {
        canChat = isFriend;
      }

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName ?? null,
        avatar: user.avatar ?? null,
        email: user.email ?? null,
        canChat,
        ...stats,
      };
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
  ): Promise<GetMessagesResponseDto> {
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
        type: m.type,
        senderId: m.senderId,
        receiverId: m.receiverId ?? null,
        groupId: m.groupId ?? null,
        content: m.content ?? null,
        replyTo: m.replyTo ?? null,
        attachments: Array.isArray(m.attachments)
          ? (m.attachments as unknown as MessageAttachment[])
          : null,
        status: m.status,
        createdAt: m.createdAt,
        sender: { ...m.sender, canChat: null },
        receiver: m.receiver ? { ...m.receiver, canChat: null } : null,
        seenBy: m.seenBy.map((item: any) => item.user),
      };
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

    // validate replyTo
    if (input.replyTo) {
      const message = await this.prisma.message.findFirst({
        where: {
          id: input.replyTo,
        },
      });
      if (!message) {
        throw new BadRequestException(ErrorCode.MESSAGE_NOT_FOUND);
      }
    }

    // Validate content or attachments
    const hasContent = !!input.content?.trim();
    const hasAttachments = !!(
      input.attachments && input.attachments.length > 0
    );
    if (!hasContent && !hasAttachments) {
      throw new BadRequestException(
        ErrorCode.MESSAGE_CONTENT_OR_ATTACHMENTS_REQUIRED,
      );
    }

    // Convert Attachments to plain JSON
    const attachmentsJson = input.attachments
      ? JSON.parse(JSON.stringify(input.attachments))
      : null;

    return await this.prisma.message.create({
      data: {
        senderId: input.senderId,
        receiverId: input.receiverId,
        groupId: input.groupId,
        type: input.type,
        content: input.content?.trim(),
        replyTo: input.replyTo,
        attachments: attachmentsJson,
      },
      select: {
        id: true,
        type: true,
        senderId: true,
        content: true,
        replyTo: true,
        status: true,
        createdAt: true,
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

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
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
  async findLastGroupMessage(
    groupId: string,
  ): Promise<MessageWithDetails | null> {
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

    if (!message) return null;

    return {
      id: message.id,
      type: message.type,
      senderId: message.senderId,
      receiverId: message.receiverId ?? null,
      groupId: message.groupId ?? null,
      content: message.content ?? null,
      replyTo: message.replyTo ?? null,
      attachments:
        (message.attachments as unknown as MessageAttachment[]) ?? null,
      status: message.status ?? null,
      createdAt: message.createdAt,
      sender: { ...message.sender, canChat: null },
      receiver: message.receiver
        ? { ...message.receiver, canChat: null }
        : null,
      seenBy: message.seenBy.map((m) => ({ ...m.user, canChat: null })),
    };
  }

  async countUnreadGroupMessages(
    groupId: string,
    userId: string,
  ): Promise<number> {
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

    return messages.map((m) => {
      return {
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId ?? null,
        groupId: m.groupId ?? null,
        content: m.content ?? null,
        replyTo: m.replyTo ?? null,
        type: m.type ?? MessageType.GROUP,
        attachments: Array.isArray(m.attachments)
          ? (m.attachments as unknown as MessageAttachment[])
          : null,
        status: m.status,
        createdAt: m.createdAt,
        sender: { ...m.sender, canChat: null },
        receiver: m.receiver ? { ...m.receiver, canChat: null } : null,
        seenBy: m.seenBy.map((m) => ({ ...m.user, canChat: null })) ?? [],
      };
    });
  }

  async canChat(senderId: string, receiverId: string): Promise<boolean> {
    const blockedByTarget = await this.prisma.block.findFirst({
      where: {
        blockingId: receiverId,
        blockedId: senderId,
      },
    });
    if (blockedByTarget) return false;

    const privacy = await this.prisma.userPrivacySetting.findUnique({
      where: { userId: receiverId },
    });
    const messageScope = privacy?.messageScope ?? VisibilityScope.EVERYONE;

    if (messageScope === VisibilityScope.EVERYONE) return true;
    if (messageScope === VisibilityScope.PRIVATE) return false;

    if (messageScope === VisibilityScope.FRIENDS) {
      return this.userService.checkFriendship(senderId, receiverId);
    }

    return true;
  }
}
