import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { SearchSuggestionResultResponse } from './dto/search.dto';
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

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
}
