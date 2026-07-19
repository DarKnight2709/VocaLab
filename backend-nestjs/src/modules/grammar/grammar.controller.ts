import type { RequestUser } from '@/common/types';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GrammarService } from './grammar.service';
import { CreateGrammarDto, UpdateGrammarDto } from './dto/grammar.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import {
  GetGrammarsResponseDto,
  GetCategoriesResponseDto,
  GetGrammarByIdResponseDto,
  CreateGrammarResponseDto,
  UpdateGrammarResponseDto,
  DeleteGrammarResponseDto,
} from './dto/grammar-response.dto';

@ApiTags('grammar')
@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách ngữ pháp' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'level', required: false })
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('level') level?: string,
  ): Promise<ResponseInterceptor<GetGrammarsResponseDto>> {
    const result = await this.grammarService.getAll(page, limit, search, category, level);
    return {
      data: result,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách danh mục ngữ pháp' })
  async getCategories(): Promise<ResponseInterceptor<GetCategoriesResponseDto>> {
    const result = await this.grammarService.getCategories();
    return {
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết ngữ pháp theo id' })
  async getById(@Param('id') id: string): Promise<ResponseInterceptor<GetGrammarByIdResponseDto>> {
    const result = await this.grammarService.getById(id);
    return {
      data: result,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới ngữ pháp' })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateGrammarDto,
  ): Promise<ResponseInterceptor<CreateGrammarResponseDto>> {
    const result = await this.grammarService.create(user.id, dto);
    return {
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật ngữ pháp theo id' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateGrammarDto,
  ): Promise<ResponseInterceptor<UpdateGrammarResponseDto>> {
    const result = await this.grammarService.update(id, user.id, dto);
    return {
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ngữ pháp theo id' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ResponseInterceptor<DeleteGrammarResponseDto>> {
    const result = await this.grammarService.delete(id, user.id);
    return {
      data: result,
    };
  }
}
