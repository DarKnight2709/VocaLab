import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
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
  GetGroupsResponseDto,
} from './dto/messages-response.dto';
import { MessageAttachmentDto } from './dto/messages.dto';
import { GroupChatService } from '../group-chat/group-chat.service';
import { UserResponse } from '../users/dto/users-response.dto';

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
    @Inject(forwardRef(() => GroupChatService))
    private readonly groupChatService: GroupChatService,
  ) {}

  async getConversations(userId: string): Promise<GetConversationsResponseDto> {
    // 1. Find all blocks where current userId is the blocked user and fetch all follows to determine friendship
    const [blockerUserIds, follows] = await Promise.all([
      this.userService.getBlockerIdsOf(userId),
      this.prisma.follow.findMany({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      }),
    ]);

    const followingIds = new Set(
      follows.filter((f) => f.followerId === userId).map((f) => f.followingId),
    );
    const followerIds = new Set(
      follows.filter((f) => f.followingId === userId).map((f) => f.followerId),
    );

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
    const statsMap = new Map<
      string,
      { lastMessage: LastMessageInfo; unreadCount: number }
    >();

    for (const msg of messages) {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!otherUserId) continue;

      // Build the stats map
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
      if (
        msg.receiverId === userId &&
        !msg.seenBy.some((s) => s.userId === userId)
      ) {
        statsMap.get(otherUserId)!.unreadCount++;
      }
    }

    // 4. Fetch users only for the conversation partners identified
    const chattedUserIds = Array.from(statsMap.keys());

    const allUsers = await this.prisma.user.findMany({
      where: {
        id: {
          in: chattedUserIds,
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

    // 5. Combine all users with their stats and privacy capabilities
    const users = allUsers.map((user) => {
      const stats = statsMap.get(user.id)!;
      const isFriend = followingIds.has(user.id) && followerIds.has(user.id);
      const scope =
        user.privacySettings?.messageScope ?? VisibilityScope.EVERYONE;

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName ?? null,
        avatar: user.avatar ?? null,
        email: user.email ?? null,
        canChat:
          scope === VisibilityScope.PRIVATE
            ? false
            : scope === VisibilityScope.FRIENDS
              ? isFriend
              : true,
        ...stats,
      };
    });

    return {
      users: users.sort(
        (a, b) =>
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime(),
      ),
    };
  }

  async getFriends(userId: string): Promise<UserResponse[]> {
    const [blockerUserIds, follows] = await Promise.all([
      this.userService.getBlockerIdsOf(userId),
      this.prisma.follow.findMany({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      }),
    ]);

    const followingIds = new Set(
      follows.filter((f) => f.followerId === userId).map((f) => f.followingId),
    );
    const followerIds = new Set(
      follows.filter((f) => f.followingId === userId).map((f) => f.followerId),
    );

    const friendIds = Array.from(followingIds).filter(
      (id) => followerIds.has(id) && !blockerUserIds.includes(id)
    );

    const friends = await this.prisma.user.findMany({
      where: {
        id: { in: friendIds },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
      },
    });

    return friends;
  }

  async getGroups(userId: string): Promise<GetGroupsResponseDto[]> {
    const groups = await this.groupChatService.findUserGroups(userId);
    const transformedGroups = await Promise.all(
      groups.map(async (group) => {
        const [lastMessage, unreadCount] = await Promise.all([
          this.findLastGroupMessage(group.id),
          this.countUnreadGroupMessages(group.id, userId),
        ]);

        return {
          id: group.id,
          name: group.name,
          avatar: group.avatar,
          description: group.description,
          isPublic: group.isPublic,
          unreadCount,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderName: lastMessage.sender?.fullName,
                isMine: lastMessage.senderId === userId,
              }
            : null,
          members: group.members?.map((m) => m.userId) || [],
          updatedAt: group.updatedAt,
        };
      }),
    );

    return transformedGroups.sort(
      (a, b) =>
        (b.lastMessage?.createdAt?.getTime() || b.updatedAt.getTime()) -
        (a.lastMessage?.createdAt?.getTime() || a.updatedAt.getTime()),
    );
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
