import type { RequestUser } from '@/common/types';
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
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
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
import {
  CreateBlogResponseDto,
  CreateCommentResponseDto,
  DeleteResponseDto,
  GetBlogByIdResponseDto,
  GetBlogsResponseDto,
  GetMyBlogsResponseDto,
  UpdateBlogResponseDto,
  UpdateCommentResponseDto,
} from './dto/blog-response.dto';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @SerializeOptions({ type: GetBlogsResponseDto, excludeExtraneousValues: true })
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách blog công khai' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBlogs(
    @CurrentUser() user: RequestUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetBlogsResponseDto> {
    const result = await this.blogService.getBlogs(user?.id, page, limit, search);
    return result;
  }

  @Get(':id')
  @SerializeOptions({ type: GetBlogByIdResponseDto, excludeExtraneousValues: true })
  @Public()
  @ApiOperation({ summary: 'Xem chi tiết bài viết' })
  async getBlogById(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<GetBlogByIdResponseDto> {
    const result = await this.blogService.getBlogById(id, user?.id);
    return result;
  }

  @Get('me/list')
  @SerializeOptions({ type: GetMyBlogsResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Lấy blog của tôi' })
  async getMyBlogs(
    @CurrentUser() user: RequestUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<GetMyBlogsResponseDto> {
    const result = await this.blogService.getMyBlogs(user.id, page, limit);
    return result;
  }

  @Post()
  @SerializeOptions({ type: CreateBlogResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  async createBlog(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateBlogDto,
  ): Promise<CreateBlogResponseDto> {
    const result = await this.blogService.createBlog(user.id, dto);
    return result;
  }

  @Patch(':id')
  @SerializeOptions({ type: UpdateBlogResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  async updateBlog(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateBlogDto,
  ): Promise<UpdateBlogResponseDto> {
    const result = await this.blogService.updateBlog(id, user.id, dto);
    return result;
  }

  @Delete(':id')
  @SerializeOptions({ type: DeleteResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Xóa bài viết' })
  async deleteBlog(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<DeleteResponseDto> {
    const result = await this.blogService.deleteBlog(id, user.id);
    return result;
  }

  // ---------- Votes ----------

  @Post(':id/vote')
  @ApiOperation({ summary: 'Upvote/Downvote bài viết' })
  async voteBlog(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: VoteBlogDto,
  ): Promise<void> {
    await this.blogService.voteBlog(id, user.id, dto.type);
  }

  // ---------- Comments ----------

  @Post(':id/comments')
  @SerializeOptions({ type: CreateCommentResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Thêm bình luận' })
  async createComment(
    @Param('id') blogId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCommentDto,
  ): Promise<CreateCommentResponseDto> {
    const result = await this.blogService.createComment(blogId, user.id, dto);
    return result;
  }

  @Patch('comments/:commentId')
  @SerializeOptions({ type: UpdateCommentResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Chỉnh sửa bình luận' })
  async editComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateCommentDto,
  ): Promise<UpdateCommentResponseDto> {
    const result = await this.blogService.editComment(commentId, user.id, dto);
    return result;
  }

  @Delete('comments/:commentId')
  @SerializeOptions({ type: DeleteResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Xóa bình luận' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<DeleteResponseDto> {
    const result = await this.blogService.deleteComment(commentId, user.id);
    return result;
  }

  @Post('comments/:commentId/reply')
  @SerializeOptions({ type: CreateCommentResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Phản hồi bình luận' })
  async replyComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ReplyCommentDto,
  ): Promise<CreateCommentResponseDto> {
    const result = await this.blogService.replyComment(commentId, user.id, dto);
    return result;
  }

  @Post('comments/:commentId/vote')
  @ApiOperation({ summary: 'Upvote/Downvote bình luận' })
  async voteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: VoteBlogDto,
  ): Promise<void> {
    await this.blogService.voteComment(commentId, user.id, dto.type);
  }
}
