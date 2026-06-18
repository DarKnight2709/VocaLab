import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { SearchSuggestionResultResponse } from './dto/search.dto';
import { VocabularyService } from '../vocabulary/vocabulary.service';
import { BlogService } from '../blog/blog.service';
import { UserService } from '../users/users.service';
import { GroupChatService } from '../group-chat/group-chat.service';
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService,
    private readonly vocabularyService: VocabularyService,
    private readonly blogService: BlogService,
    private readonly groupService: GroupChatService,
    private readonly userService: UserService
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
        },
        take: 3, // Limit each source to ensure diversity
        select: { id: true, name: true },
      }),
      this.prisma.blog.findMany({
        where: {
          title: { contains: normalizedQuery, mode: 'insensitive' },
        },
        take: 3,
        select: { id: true, title: true },
      }),
      this.prisma.group.findMany({
        where: {
          name: { contains: normalizedQuery, mode: 'insensitive' },
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


  // async searchSidebar(userId: string, query: string): Promise<SidebarSearchResultResponse> {
  //   if (!query || query.length < 2) {
  //     return {
  //       collections: {
  //         collections: [],
  //         meta: {
  //           page: 1,
  //           limit: 4,
  //           total: 0,
  //           totalPages: 0,
  //         },
  //       },
  //       groups: [],
  //       profiles: [],
  //     } as any;
  //   }


  //   // search collections
  //   const collectionsData = await this.vocabularyService.searchCollections(userId, 1, 4, query);    
    

  //   // search groups
  //   const { groups: groupsData } = await this.groupService.searchGroups(userId, 1, 5, query);


  //   // // search users
  //   const { users: usersData } = await this.userService.getUsers(userId, 1, 5, query);

  //   return {
  //     collections: [],
  //     groups: [],
  //     profiles: [],
  //   }
  // }

  // async searchCollections(userId?: string, page = 1, limit = 10, query?: string) {
  //   return this.vocabularyService.searchCollections(userId ?? '', page, limit, query);
  // }

  async searchPosts(userId: string, page = 1, limit = 10, query?: string) {
    return this.blogService.getBlogs(userId, page, limit, query);
  }

  async searchGroups(userId: string, page = 1, limit = 10, query?: string) {
    return this.groupService.searchGroups(userId, page, limit, query);
  }

  // async searchProfiles(userId?: string, page = 1, limit = 10, query?: string) {
  //   return this.userService.getUsers(userId ?? '', page, limit, query);
  // }
}
