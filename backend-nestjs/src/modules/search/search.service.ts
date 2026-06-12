import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { SearchSuggestionResultResponse } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(query: string): Promise<SearchSuggestionResultResponse[]> {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.trim();

    // In a real app, you might search across multiple tables (Collections, Cards, Blogs, etc.)
    // For now, let's search in CardCollections
    const collections = await this.prisma.cardCollection.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { description: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
      },
    });

    return collections.map((col) => ({
      id: col.id,
      text: col.name,
    }));
  }
}
