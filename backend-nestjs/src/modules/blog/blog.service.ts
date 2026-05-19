import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { VoteType } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateCommentDto,
  UpdateCommentDto,
  ReplyCommentDto,
} from './dto/blog.dto';
import { mapVoteScore } from '@/common/utils/vote.utils';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { CreateBlogResponseDto, CreateCommentResponseDto, DeleteResponseDto, GetBlogByIdResponseDto, GetBlogsResponseDto, GetMyBlogsResponseDto, UpdateBlogResponseDto, UpdateCommentResponseDto } from './dto/blog-response.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ==================== BLOG CRUD ====================

  async getBlogs(userId?: string, page = 1, limit = 10, search?: string): Promise<GetBlogsResponseDto> {
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      deletedAt: null,
    };

    if (userId) {
      const blockRelations = await this.prisma.block.findMany({
        where: {
          blockedId: userId,
        },
        select: {
          blockingId: true,
        },
      });

      const blockerIds = blockRelations.map((r) => r.blockingId);

      if (blockerIds.length > 0) {
        where.authorId = {
          notIn: blockerIds,
        };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    let [searchedBlogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        // order by createAt
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,

        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          votes: true,
          _count: {
            select: { comments: true },
          },
        },
      }),
      this.prisma.blog.count({
        where,
      }),
    ]);

    const formattedBlogs = searchedBlogs.map((blog) =>
      mapVoteScore(blog, userId),
    );

    return {
      blogs: formattedBlogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBlogById(id: string, userId?: string): Promise<GetBlogByIdResponseDto> {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
        _count: { select: { comments: true } },
        votes: { select: { type: true, userId: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
            votes: {
              select: {
                type: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!blog) throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);

    if (userId && userId !== blog.authorId) {
      const blockedByTarget = await this.prisma.block.findFirst({
        where: {
          blockingId: blog.authorId,
          blockedId: userId,
        },
      });
      if (blockedByTarget) {
        throw new ForbiddenException(ErrorCode.BLOG_ACCESS_FORBIDDEN);
      }
    }

    if (!blog.isPublic && blog.authorId !== userId) {
      throw new ForbiddenException(ErrorCode.BLOG_ACCESS_FORBIDDEN);
    }

    const deletedCommentMap = blog.comments.map((c) => ({
      ...c,
      content: c.deletedAt ? null : c.content,
    }));

    const treeComment = this.buildCommentTree(deletedCommentMap);
    const commentsWithVotes = this.mapCommentVotesInTree(treeComment, userId);

    const { comments, ...rest } = blog;

    const formattedBlog = {
      ...rest,
      comments: commentsWithVotes,
    };
    
    const mappedBlog = mapVoteScore(formattedBlog, userId);

    return mappedBlog;
  }

  async getMyBlogs(userId: string, page = 1, limit = 10): Promise<GetMyBlogsResponseDto> {
    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { authorId: userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { comments: true } },
          votes: { select: { type: true } },
        },
      }),
      this.prisma.blog.count({ where: { authorId: userId, deletedAt: null } }),
    ]);

    const formattedBlogs = blogs.map((blog) => mapVoteScore(blog));

    return {
      blogs: formattedBlogs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createBlog(userId: string, dto: CreateBlogDto): Promise<CreateBlogResponseDto> {
    const blog = await this.prisma.blog.create({
      data: {
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        isPublic: dto.isPublic ?? true,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
    });

    return blog;
  }

  async updateBlog(id: string, userId: string, dto: UpdateBlogDto): Promise<UpdateBlogResponseDto> {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
    });
    if (!blog) throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
    if (blog.authorId !== userId)
      throw new ForbiddenException(ErrorCode.BLOG_EDIT_FORBIDDEN);
    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
        _count: { select: { comments: true } },
      },
    });

    return updatedBlog;
  }

  async deleteBlog(id: string, userId: string): Promise<DeleteResponseDto> {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
    });
    if (!blog) throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
    if (blog.authorId !== userId)
      throw new ForbiddenException(ErrorCode.BLOG_DELETE_FORBIDDEN);
    const deletedBlog = await this.prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id: deletedBlog.id };
  }

  // ==================== VOTES ====================

  async voteBlog(blogId: string, userId: string, type: VoteType): Promise<void> {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id: blogId,
        deletedAt: null,
      },
    });

    if (!blog) {
      throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
    }

    const userVote = await this.prisma.blogVote.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (userVote) {
      // có rồi thì thì update
      // nếu mà trùng với type thì xóa còn khác type thì update
      if (type === userVote.type) {
        await this.prisma.blogVote.delete({
          where: {
            userId_blogId: {
              userId,
              blogId,
            },
          },
        });
      } else {
        await this.prisma.blogVote.update({
          where: {
            userId_blogId: {
              userId,
              blogId,
            },
          },
          data: {
            type,
          },
        });
      }
    } else {
      // chưa có thì tạo
      await this.prisma.blogVote.create({
        data: {
          userId,
          blogId,
          type,
        },
      });
    }
  }

  // ==================== COMMENTS ====================

  async createComment(blogId: string, userId: string, dto: CreateCommentDto): Promise<CreateCommentResponseDto> {
    const blog = await this.prisma.blog.findFirst({
      where: {
        id: blogId,
        deletedAt: null,
      },
    });

    if (!blog) {
      throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
    }

    const comment =await this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId: userId,
        blogId,
      },
    });
    return comment;
  }

  async editComment(commentId: string, userId: string, dto: UpdateCommentDto): Promise<UpdateCommentResponseDto> {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });
    if (!comment) throw new NotFoundException(ErrorCode.COMMENT_NOT_FOUND);
    if (comment.authorId !== userId)
      throw new ForbiddenException(ErrorCode.COMMENT_EDIT_FORBIDDEN);

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
    });

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string): Promise<DeleteResponseDto> {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });
    if (!comment) throw new NotFoundException(ErrorCode.COMMENT_NOT_FOUND);
    if (comment.authorId !== userId)
      throw new ForbiddenException(ErrorCode.COMMENT_DELETE_FORBIDDEN);
    const deletedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
    return {
      id: deletedComment.id
    };
  }

  async replyComment(commentId: string, userId: string, dto: ReplyCommentDto): Promise<CreateCommentResponseDto> {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
        blog: {
          deletedAt: null,
        },
      },
    });

    if (!comment) throw new NotFoundException(ErrorCode.COMMENT_NOT_FOUND);

    const replyComment = await this.prisma.comment.create({
      data: {
        content: dto.reply,
        blogId: comment.blogId,
        authorId: userId,
        parentCommentId: comment.id,
      },
    });
    return replyComment;
  }

  async voteComment(commentId: string, userId: string, type: VoteType): Promise<void> {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
    });

    if (!comment) throw new NotFoundException(ErrorCode.COMMENT_NOT_FOUND);

    const userVote = await this.prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (userVote) {
      if (type === userVote.type) {
        await this.prisma.commentVote.delete({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
        });
      } else {
        await this.prisma.commentVote.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: {
            type,
          },
        });
      }
    } else {
      await this.prisma.commentVote.create({
        data: {
          userId,
          commentId,
          type,
        },
      });
    }
  }

  // ==================== SEARCH ====================

  async searchBlogs(keyword: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
      isPublic: true,
      deletedAt: null as null,
      OR: [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { excerpt: { contains: keyword, mode: 'insensitive' as const } },
      ],
    };

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, fullName: true, avatar: true },
          },
          _count: { select: { comments: true } },
          votes: { select: { type: true } },
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    const formattedBlogs = blogs.map((blog) => mapVoteScore(blog));

    return {
      blogs: formattedBlogs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private mapCommentVotesInTree(
    comments: any[],
    currentUserId?: string,
  ): any[] {
    return comments.map((comment) => {
      let voteScore = 0;
      let userVote: VoteType | null = null;

      comment.votes?.forEach((v: any) => {
        if (v.type === VoteType.UPVOTE) voteScore++;
        else if (v.type === VoteType.DOWNVOTE) voteScore--;

        if (currentUserId && v.userId === currentUserId) {
          userVote = v.type;
        }
      });

      return {
        ...comment,
        voteScore,
        userVote,
        votes: undefined,
        replies: this.mapCommentVotesInTree(
          comment.replies || [],
          currentUserId,
        ),
      };
    });
  }

  private buildCommentTree(
    comments: {
      content: string | null;
      author: {
        id: string;
        username: string;
        fullName: string;
        avatar: string | null;
      };
      id: string;
      authorId: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      blogId: string;
      parentCommentId: string | null;
      votes?: { type: VoteType; userId: string }[];
    }[],
    parentId: string | null = null,
  ) {
    return comments
      .filter((c) => c.parentCommentId === parentId)
      .map((c) => {
        return {
          ...c,
          replies: this.buildCommentTree(comments, c.id),
        };
      });
  }
}
