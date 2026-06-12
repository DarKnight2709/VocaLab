import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchSuggestionResultResponse } from './dto/search.dto';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';


@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggestion')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ type: SearchSuggestionResultResponse, isArray: true })
  async getSuggestions(@Query('query') query: string): Promise<ResponseInterceptor<SearchSuggestionResultResponse[]>> {
    const result = await this.searchService.getSuggestions(query);
    return {
      data: result
    }
  }
}
