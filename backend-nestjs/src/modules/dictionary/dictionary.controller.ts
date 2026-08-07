import { Controller, Get, Query, Param, SerializeOptions } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SearchSuggestionResultResponse } from '../search/dto/search-response.dto';
import { DictionaryLookupResponse } from './dto/dictionary-response.dto';
import { Public } from '@/common/decorators/public.decorator';
import { DictionaryService } from './dictionary.service';

@ApiTags('dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('suggestion')
  @SerializeOptions({ type: SearchSuggestionResultResponse, excludeExtraneousValues: true })
  @Public()
  @ApiOperation({ summary: 'Get dictionary suggestions' })
  @ApiResponse({ type: SearchSuggestionResultResponse, isArray: true })
  async getSuggestions(
    @Query('query') query: string,
  ): Promise<SearchSuggestionResultResponse[]> {
    const result = await this.dictionaryService.getSuggestions(query);
    return result || [];
  }

  @Get('lookup/:word')
  @SerializeOptions({ type: DictionaryLookupResponse, excludeExtraneousValues: true })
  @Public()
  @ApiOperation({ summary: 'Lookup full word definition' })
  @ApiResponse({ type: DictionaryLookupResponse })
  async lookupWord(
    @Param('word') word: string,
  ): Promise<DictionaryLookupResponse | null> {
    const result = await this.dictionaryService.lookupWord(word);
    return result;
  }
}
