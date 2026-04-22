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
import { GrammarService } from './grammar.service';
import { CreateGrammarDto, UpdateGrammarDto } from './dto/grammar.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get()
  @ApiOperation({ summary: "Lấy danh sách ngữ pháp"})
  getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('level') level?: string,
  ) {
    return this.grammarService.getAll(page, limit, search, category, level);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách danh mục ngữ pháp' })
  getCategories() {
    return this.grammarService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết ngữ pháp theo id' })
  getById(@Param('id') id: string) {
    return this.grammarService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới ngữ pháp' })
  create(@CurrentUser() user: any, @Body() dto: CreateGrammarDto) {
    return this.grammarService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật ngữ pháp theo id' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateGrammarDto,
  ) {
    return this.grammarService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ngữ pháp theo id' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.grammarService.delete(id, user.id);
  }
}
