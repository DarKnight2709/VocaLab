import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ==================== BLOG CRUD ====================

  async getBlogs(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      isPublic: true,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

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
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      blogs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBlogById(id: string, userId?: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
        _count: { select: { comments: true, likes: true } },
        comments: {
          where: { deletedAt: null },
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
          },
        },
      },
    });

    if (!blog) throw new NotFoundException('Bài viết không tồn tại');
    if (!blog.isPublic && blog.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem bài viết này');
    }

    const isLiked = userId
      ? !!(await this.prisma.blogLike.findUnique({
          where: { userId_blogId: { userId, blogId: id } },
        }))
      : false;

    return { blog: { ...blog, isLiked } };
  }

  async getMyBlogs(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { authorId: userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.blog.count({ where: { authorId: userId, deletedAt: null } }),
    ]);

    return {
      blogs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createBlog(userId: string, dto: CreateBlogDto) {
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

    return { message: 'Tạo bài viết thành công', blog };
  }

  async updateBlog(id: string, userId: string, dto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
    });
    if (!blog) throw new NotFoundException('Bài viết không tồn tại');
    if (blog.authorId !== userId)
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');

    const updated = await this.prisma.blog.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
    });

    return { message: 'Cập nhật bài viết thành công', blog: updated };
  }

  async deleteBlog(id: string, userId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
    });
    if (!blog) throw new NotFoundException('Bài viết không tồn tại');
    if (blog.authorId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');

    await this.prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Xóa bài viết thành công' };
  }

  // ==================== LIKES ====================

  async toggleLike(blogId: string, userId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id: blogId, deletedAt: null },
    });
    if (!blog) throw new NotFoundException('Bài viết không tồn tại');

    const existing = await this.prisma.blogLike.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

    if (existing) {
      await this.prisma.blogLike.delete({
        where: { userId_blogId: { userId, blogId } },
      });
      const count = await this.prisma.blogLike.count({ where: { blogId } });
      return { liked: false, likeCount: count };
    } else {
      await this.prisma.blogLike.create({ data: { userId, blogId } });
      const count = await this.prisma.blogLike.count({ where: { blogId } });
      return { liked: true, likeCount: count };
    }
  }

  // ==================== COMMENTS ====================

  async createComment(blogId: string, userId: string, dto: CreateCommentDto) {
    const blog = await this.prisma.blog.findFirst({
      where: { id: blogId, deletedAt: null },
    });
    if (!blog) throw new NotFoundException('Bài viết không tồn tại');

    const comment = await this.prisma.comment.create({
      data: { content: dto.content, blogId, authorId: userId },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
    });

    return { message: 'Bình luận thành công', comment };
  }

  async updateComment(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.authorId !== userId)
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa bình luận này',
      );

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
    });

    return { message: 'Cập nhật bình luận thành công', comment: updated };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.authorId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
    return { message: 'Xóa bình luận thành công' };
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
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      blogs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
