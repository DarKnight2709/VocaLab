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
  ApiQuery,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateCommentDto,
  UpdateCommentDto,
  VoteBlogDto,
  ReplyCommentDto,
} from './dto/blog.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách blog công khai' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBlogs(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.blogService.getBlogs(user?.id, page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết bài viết' })
  async getBlogById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.getBlogById(id, user?.id);
  }

  @Get('me/list')
  @ApiOperation({ summary: 'Lấy blog của tôi' })
  async getMyBlogs(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.blogService.getMyBlogs(user.id, page, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  async createBlog(@CurrentUser() user: any, @Body() dto: CreateBlogDto) {
    return this.blogService.createBlog(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  async updateBlog(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogService.updateBlog(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài viết' })
  async deleteBlog(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.deleteBlog(id, user.id);
  }

  // ---------- Votes ----------

  @Post(':id/vote')
  @ApiOperation({ summary: 'Upvote/Downvote bài viết' })
  async voteBlog(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: VoteBlogDto,
  ) {
    return this.blogService.voteBlog(id, user.id, dto.type);
  }

  // ---------- Comments ----------

  @Post(':id/comments')
  @ApiOperation({ summary: 'Thêm bình luận' })
  async createComment(
    @Param('id') blogId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.blogService.createComment(blogId, user.id, dto);
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Chỉnh sửa bình luận' })
  async editComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.blogService.editComment(commentId, user.id, dto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Xóa bình luận' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.blogService.deleteComment(commentId, user.id);
  }



  @Post('comments/:commentId/reply')
  @ApiOperation({ summary: 'Phản hồi bình luận' })
  async replyComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
    @Body() dto: ReplyCommentDto
  ) {
    return this.blogService.replyComment(commentId, user.id, dto);
  }

  @Post('comments/:commentId/vote')
  @ApiOperation({ summary: 'Upvote/Downvote bình luận' })
  async voteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
    @Body() dto: VoteBlogDto,
  ) {
    return this.blogService.voteComment(commentId, user.id, dto.type);
  }
}
