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
  SerializeOptions,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GrammarService } from './grammar.service';
import { CreateGrammarDto, UpdateGrammarDto } from './dto/grammar.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import {
  CategoriesResponseDto,
  CreateGrammarResponseDto,
  GrammarItemDto,
  GrammarsResponseDto,
} from './dto/grammar-response.dto';

@ApiTags('grammar')
@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get()
  @SerializeOptions({ type: GrammarsResponseDto, excludeExtraneousValues: true })
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
  ): Promise<GrammarsResponseDto> {
    const result = await this.grammarService.getAll(page, limit, search, category, level);
    return result;
  }

  @Get('categories')
  @SerializeOptions({ type: CategoriesResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Lấy danh sách danh mục ngữ pháp' })
  async getCategories(): Promise<CategoriesResponseDto> {
    const result = await this.grammarService.getCategories();
    return result;
  }

  @Get(':id')
  @SerializeOptions({ type: GrammarItemDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Lấy chi tiết ngữ pháp theo id' })
  async getById(@Param('id') id: string): Promise<GrammarItemDto> {
    const result = await this.grammarService.getById(id);
    return result;
  }

  @Post()
  @SerializeOptions({ type: CreateGrammarResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Tạo mới ngữ pháp' })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateGrammarDto,
  ): Promise<CreateGrammarResponseDto> {
    const result = await this.grammarService.create(user.id, dto);
    return result;
  }

  @Patch(':id')
  @SerializeOptions({ type: CreateGrammarResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Cập nhật ngữ pháp theo id' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateGrammarDto,
  ): Promise<CreateGrammarResponseDto> {
    const result = await this.grammarService.update(id, user.id, dto);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ngữ pháp theo id' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    const result = await this.grammarService.delete(id, user.id);
    return result;
  }
}
