import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateGrammarDto, UpdateGrammarDto } from './dto/grammar.dto';
import { ErrorCode } from '@/common/enums/error-code.enum';
import {
  CategoriesResponseDto,
  CreateGrammarResponseDto,
  GrammarItemDto,
  GrammarsResponseDto,
} from './dto/grammar-response.dto';

@Injectable()
export class GrammarService {
  private readonly logger = new Logger(GrammarService.name);

  constructor(private prisma: PrismaService) {}

  async getAll(
    page = 1,
    limit = 20,
    search?: string,
    category?: string,
    level?: string,
  ): Promise<GrammarsResponseDto> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { structure: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (level) where.level = level;

    const [items, total] = await Promise.all([
      this.prisma.grammarStructure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isDefault: 'desc' }, { category: 'asc' }, { title: 'asc' }],
        include: {
          author: { select: { id: true, username: true, fullName: true } },
        },
      }),
      this.prisma.grammarStructure.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCategories(): Promise<CategoriesResponseDto> {
    const items = await this.prisma.grammarStructure.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
      orderBy: { category: 'asc' },
    });
    
    return { categories: items.map((i) => i.category).filter(Boolean) as string[] };
  }

  async getById(id: string): Promise<GrammarItemDto> {
    const item = await this.prisma.grammarStructure.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, fullName: true } },
      },
    });
    if (!item) throw new NotFoundException(ErrorCode.GRAMMAR_NOT_FOUND);
    return item;
  }

  async create(userId: string, dto: CreateGrammarDto): Promise<CreateGrammarResponseDto> {
    const item = await this.prisma.grammarStructure.create({
      data: {
        title: dto.title,
        structure: dto.structure,
        explanation: dto.explanation,
        examples: dto.examples ?? [],
        category: dto.category,
        level: dto.level,
        isDefault: false,
        authorId: userId,
      },
    });
    return item;
  }

  async update(id: string, userId: string, dto: UpdateGrammarDto): Promise<CreateGrammarResponseDto> {
    const item = await this.prisma.grammarStructure.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(ErrorCode.GRAMMAR_NOT_FOUND);
    if (!item.isDefault && item.authorId !== userId) {
      throw new ForbiddenException(ErrorCode.GRAMMAR_EDIT_FORBIDDEN);
    }

    const updated = await this.prisma.grammarStructure.update({
      where: { id },
      data: dto,
    });
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const item = await this.prisma.grammarStructure.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(ErrorCode.GRAMMAR_NOT_FOUND);
    if (item.isDefault || item.authorId !== userId) {
      throw new ForbiddenException(ErrorCode.GRAMMAR_DELETE_FORBIDDEN);
    }
    await this.prisma.grammarStructure.delete({ where: { id } });
  }
}
