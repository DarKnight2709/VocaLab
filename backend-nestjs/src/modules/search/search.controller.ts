import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import { GetBlogsResponseDto } from '../blog/dto/blog-response.dto';
import { GroupsSearchResultResponse } from '../group-chat/dto/group-chat-response.dto';
import { ProfileSearchResultResponse } from '../users/dto/users-response.dto';
import { CollectionSearchResponseDto } from '../vocabulary/dto/vocabulary-response.dto';
import {
  SearchSuggestionResultResponse,
  SidebarSearchResultResponse,
} from './dto/search.dto';
import { PostSearchQueryDto, SideBarSearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';
import {
  SEARCH_SORT,
  SEARCH_TIME,
  SEARCH_SORT as SEARCH_SORT_VALUES,
  SEARCH_TIME as SEARCH_TIME_VALUES,
} from './search.types';

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

  @Get('sidebar')
  @ApiOperation({ summary: 'Get sidebar search results' })
  @ApiResponse({ type: SidebarSearchResultResponse })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: Object.values(SEARCH_SORT_VALUES),
    default: SEARCH_SORT.NEWEST,
  })
  @ApiQuery({
    name: 'time',
    required: false,
    enum: Object.values(SEARCH_TIME_VALUES),
    default: SEARCH_TIME.ALL,
  })
  async searchSidebar(
    @CurrentUser() user: any,
    @Query() query: SideBarSearchQueryDto,
  ): Promise<ResponseInterceptor<SidebarSearchResultResponse>> {
    const result = await this.searchService.searchSidebar(
      user.id,
      query.query,
      {
        sort: query.sort,
        time: query.time,
      },
    );
    return { data: result };
  }

  @Get('collections')
  @ApiOperation({ summary: 'Get collections search results' })
  @ApiResponse({ type: CollectionSearchResponseDto })
  async searchCollections(
    @CurrentUser() user: any,
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseInterceptor<CollectionSearchResponseDto>> {
    const result = await this.searchService.searchCollections(
      user.id,
      Number(page) || 1,
      Number(limit) || 10,
      query,
    );
    return {
      data: result,
    };
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get posts search results' })
  @ApiResponse({ type: GetBlogsResponseDto })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({ name: 'page', required: false, default: 1 })
  @ApiQuery({ name: 'limit', required: false, default: 10 })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: Object.values(SEARCH_SORT_VALUES),
    default: SEARCH_SORT.NEWEST,
  })
  @ApiQuery({
    name: 'time',
    required: false,
    enum: Object.values(SEARCH_TIME_VALUES),
    default: SEARCH_TIME.ALL,
  })
  async searchPosts(
    @CurrentUser() user: any,
    @Query() query: PostSearchQueryDto,
  ): Promise<ResponseInterceptor<GetBlogsResponseDto>> {
    const result = await this.searchService.searchPosts(
      user.id,
      query.page,
      query.limit,
      query.query,
      {
        sort: query.sort,
        time: query.time,
      },
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

  @Get('profiles')
  @ApiOperation({ summary: 'Get profiles search results' })
  @ApiResponse({ type: ProfileSearchResultResponse })
  async searchProfiles(
    @CurrentUser() user: any,
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseInterceptor<ProfileSearchResultResponse>> {
    const result = await this.searchService.searchProfiles(
      user.id,
      Number(page) || 1,
      Number(limit) || 10,
      query,
    );
    return {
      data: result,
    };
  }
}
