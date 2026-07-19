import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  SearchSuggestionResultResponse,
  SidebarSearchResultResponse,
} from './dto/search.dto';
import { VocabularyService } from '../vocabulary/vocabulary.service';
import { BlogService } from '../blog/blog.service';
import { UserService } from '../users/users.service';
import { GroupChatService } from '../group-chat/group-chat.service';
import { PostSearchFilters, ProfileSearchFilters, GroupSearchFilters, CollectionSearchFilters } from './search.types';
@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vocabularyService: VocabularyService,
    private readonly blogService: BlogService,
    private readonly groupService: GroupChatService,
    private readonly userService: UserService,
  ) {}

  async getSuggestions(
    query: string,
  ): Promise<SearchSuggestionResultResponse[]> {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.trim();

    // Run all lookups in parallel
    const [collections, posts, groups, users] = await Promise.all([
      this.prisma.cardCollection.findMany({
        where: {
          name: { contains: normalizedQuery, mode: 'insensitive' },
          isPublic: true,
        },
        take: 3, // Limit each source to ensure diversity
        select: { id: true, name: true },
      }),
      this.prisma.blog.findMany({
        where: {
          title: { contains: normalizedQuery, mode: 'insensitive' },
          isPublic: true,
        },
        take: 3,
        select: { id: true, title: true },
      }),
      this.prisma.group.findMany({
        where: {
          name: { contains: normalizedQuery, mode: 'insensitive' },
          isPublic: true,
        },
        take: 3,
        select: { id: true, name: true },
      }),
      this.prisma.user.findMany({
        where: {
          fullName: { contains: normalizedQuery, mode: 'insensitive' },
        },
        take: 3,
        select: { id: true, fullName: true },
      }),
    ]);

    return [
      ...collections.map((c) => ({ id: c.id, text: c.name })),
      ...posts.map((p) => ({ id: p.id, text: p.title })),
      ...groups.map((g) => ({ id: g.id, text: g.name })),
      ...users.map((u) => ({ id: u.id, text: u.fullName })),
    ].slice(0, 5); // Ensure exactly 5 items
  }

  async searchSidebar(
    userId?: string,
    query?: string,
  ): Promise<SidebarSearchResultResponse> {
    const sanitizedQuery = query?.trim();
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return {
        collections: [],
        groups: [],
        profiles: [],
      };
    }

    // get 4 collections, 5 groups, and 5 users.
    // search collections, groups, users
    const [collectionsData, groupsData, usersData] = await Promise.all([
      this.vocabularyService.searchCollections(userId, 1, 4, sanitizedQuery),
      this.groupService.searchGroups(userId, 1, 5, sanitizedQuery),
      this.userService.getProfiles(userId, 1, 5, sanitizedQuery),
    ]);

    return {
      collections: collectionsData.collections,
      groups: groupsData.groups,
      profiles: usersData.profiles,
    };
  }

  async searchCollections(
    userId?: string,
    page = 1,
    limit = 10,
    query?: string,
    filters?: CollectionSearchFilters,
  ) {
    return this.vocabularyService.searchCollections(userId, page, limit, query, filters);
  }

  async searchPosts(
    userId?: string,
    page = 1,
    limit = 10,
    query?: string,
    _filters?: PostSearchFilters,
  ) {
    return this.blogService.getBlogs(userId, page, limit, query, _filters);
  }

  async searchGroups(userId?: string, page = 1, limit = 10, query?: string, filters?: GroupSearchFilters) {
    return this.groupService.searchGroups(userId, page, limit, query, filters);
  }

  async searchProfiles(
    userId?: string,
    page = 1,
    limit = 10,
    query?: string,
    filters?: ProfileSearchFilters,
  ) {
    return this.userService.getProfiles(userId, page, limit, query, filters);
  }
}
