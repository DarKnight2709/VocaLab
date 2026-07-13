import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import { SearchSuggestionResultResponse } from '../search/dto/search.dto';
import { DictionaryLookupResponse } from './dto/dictionary.dto';
import { Public } from '@/common/decorators/public.decorator';
import { DictionaryService } from './dictionary.service';

@ApiTags('dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('suggestion')
  @Public()
  @ApiOperation({ summary: 'Get dictionary suggestions' })
  @ApiResponse({ type: SearchSuggestionResultResponse, isArray: true })
  async getSuggestions(
    @Query('query') query: string,
  ): Promise<ResponseInterceptor<SearchSuggestionResultResponse[]>> {
    const result = await this.dictionaryService.getSuggestions(query);
    return {
      data: result || [],
    };
  }

  @Get('lookup/:word')
  @Public()
  @ApiOperation({ summary: 'Lookup full word definition' })
  @ApiResponse({ type: DictionaryLookupResponse })
  async lookupWord(
    @Param('word') word: string,
  ): Promise<ResponseInterceptor<DictionaryLookupResponse | null>> {
    const result = await this.dictionaryService.lookupWord(word);
    return {
      data: result,
    };
  }
}
