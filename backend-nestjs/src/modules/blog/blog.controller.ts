import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/blog.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsProtected } from '../../common/decorators/protected.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ---------- Public routes ----------

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách blog công khai' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBlogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.blogService.getBlogs(page, limit, search);
  }

  @Get(':id')
  @IsProtected()
  @ApiOperation({ summary: 'Xem chi tiết bài viết' })
  async getBlogById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.getBlogById(id, user?.id);
  }

  // ---------- Protected routes ----------

  @Get('me/list')
  @IsProtected()
  @ApiOperation({ summary: 'Lấy blog của tôi' })
  async getMyBlogs(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.blogService.getMyBlogs(user.id, page, limit);
  }

  @Post()
  @IsProtected()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  async createBlog(@CurrentUser() user: any, @Body() dto: CreateBlogDto) {
    return this.blogService.createBlog(user.id, dto);
  }

  @Patch(':id')
  @IsProtected()
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  async updateBlog(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogService.updateBlog(id, user.id, dto);
  }

  @Delete(':id')
  @IsProtected()
  @ApiOperation({ summary: 'Xóa bài viết' })
  async deleteBlog(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.deleteBlog(id, user.id);
  }

  // ---------- Likes ----------

  @Post(':id/like')
  @IsProtected()
  @ApiOperation({ summary: 'Toggle like bài viết' })
  async toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.toggleLike(id, user.id);
  }

  // ---------- Comments ----------

  @Post(':id/comments')
  @IsProtected()
  @ApiOperation({ summary: 'Thêm bình luận' })
  async createComment(
    @Param('id') blogId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.blogService.createComment(blogId, user.id, dto);
  }

  @Patch('comments/:commentId')
  @IsProtected()
  @ApiOperation({ summary: 'Chỉnh sửa bình luận' })
  async updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.blogService.updateComment(commentId, user.id, dto);
  }

  @Delete('comments/:commentId')
  @IsProtected()
  @ApiOperation({ summary: 'Xóa bình luận' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.blogService.deleteComment(commentId, user.id);
  }
}
