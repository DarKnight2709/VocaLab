import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import {
  SearchSuggestionResultResponse,
} from './dto/search.dto';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import { GetBlogsResponseDto } from '../blog/dto/blog-response.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GroupsSearchResultResponse } from '../group-chat/dto/group-chat-response.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggestion')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ type: SearchSuggestionResultResponse, isArray: true })
  async getSuggestions(
    @Query('query') query: string,
  ): Promise<ResponseInterceptor<SearchSuggestionResultResponse[]>> {
    const result = await this.searchService.getSuggestions(query);
    return {
      data: result,
    };
  }

  // @Get('sidebar')
  // @ApiOperation({ summary: 'Get sidebar search results' })
  // @ApiResponse({ type: SidebarSearchResultResponse })
  // async searchSidebar(
  //   @Query('query') query: string,
  //   @CurrentUser() user: any,
  // ): Promise<ResponseInterceptor<SidebarSearchResultResponse>> {
  //   const result = await this.searchService.searchSidebar(user.id, query);
  //   return {
  //     data: result,
  //   };
  // }

  @Get('posts')
  @ApiOperation({ summary: 'Get posts search results' })
  @ApiResponse({ type: GetBlogsResponseDto })
  async searchPosts(
    @CurrentUser() user: any,
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseInterceptor<GetBlogsResponseDto>> {
    const result = await this.searchService.searchPosts(
      user.id,
      Number(page) || 1,
      Number(limit) || 10,
      query,
    );
    return {
      data: result,
    };
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get groups search results' })
  @ApiResponse({ type: GroupsSearchResultResponse })
  async searchGroups(
    @CurrentUser() user: any,
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseInterceptor<GroupsSearchResultResponse>> {
    const result = await this.searchService.searchGroups(
      user.id,
      Number(page) || 1,
      Number(limit) || 10,
      query,
    );
    return {
      data: result,
    };
  }

  // @Get("profiles")
  // @ApiOperation({summary: 'Get profiles search results'})
  // @ApiResponse({type: UsersSearchResultResponse})
  // async searchProfiles(
  //   @Query('query') query: string,
  //   @Query('userId') userId?: string,
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  // ): Promise<ResponseInterceptor<UsersSearchResultResponse>> {
  //   const result = await this.searchService.searchProfiles(
  //     userId,
  //     Number(page) || 1,
  //     Number(limit) || 10,
  //     query
  //   );
  //   return {
  //     data: result
  //   }
  // }
}
