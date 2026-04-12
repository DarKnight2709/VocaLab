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
import { Public } from '../../common/decorators/public.decorator';
import { IsProtected } from '../../common/decorators/protected.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Public()
  @Get()
  getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('level') level?: string,
  ) {
    return this.grammarService.getAll(page, limit, search, category, level);
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.grammarService.getCategories();
  }

  @Public()
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.grammarService.getById(id);
  }

  @IsProtected()
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateGrammarDto) {
    return this.grammarService.create(user.id, dto);
  }

  @IsProtected()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateGrammarDto,
  ) {
    return this.grammarService.update(id, user.id, dto);
  }

  @IsProtected()
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.grammarService.delete(id, user.id);
  }
}
