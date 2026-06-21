import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CreateCardDto,
  UpdateCardDto,
  ImportCardsDto,
  CreateCardTypeDto,
} from './dto/vocabulary.dto';
import { DuplicatePolicy } from '@/common/enums/duplicate-policy.enum';
import { ErrorCode } from '@/common/enums/error-code.enum';
import {
  GetCollectionsResponseDto,
  GetCollectionByIdResponseDto,
  CreateCollectionResponseDto,
  AddCardResponseDto,
  UpdateCardResponseDto,
  ImportCardsResponseDto,
  GetCardTypesResponseDto,
  GetCardTypeByIdResponseDto,
  CreateCardTypeResponseDto,
  CardTypeWithFieldsDto,
  DeleteResponseDto,
  CollectionSearchResponseDto,
} from './dto/vocabulary-response.dto';
import { UserService } from '../users/users.service';

@Injectable()
export class VocabularyService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  // ──────────────────────────────────────────────
  // Collections
  // ──────────────────────────────────────────────

  async getCollections(userId: string): Promise<GetCollectionsResponseDto> {
    const collections = await this.prisma.cardCollection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        userId: true,
        isPublic: true,
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { collections };
  }

  async getCollectionById(
    id: string,
    userId: string,
  ): Promise<GetCollectionByIdResponseDto> {
    const collection = await this.prisma.cardCollection.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        description: true,
        userId: true,
        isPublic: true,
        cards: {
          select: {
            id: true,
            position: true,
            cardTypeId: true,
            cardType: {
              select: {
                id: true,
                name: true,
                description: true,
                fields: {
                  select: {
                    id: true,
                    key: true,
                    label: true,
                    fieldType: true,
                    side: true,
                    order: true,
                    color: true,
                    fontSize: true,
                  },
                },
              },
            },
            values: {
              select: {
                id: true,
                fieldId: true,
                value: true,
                field: {
                  select: {
                    id: true,
                    key: true,
                    label: true,
                    fieldType: true,
                    side: true,
                    order: true,
                    color: true,
                    fontSize: true,
                  },
                },
              },
            },
          },
        },
        _count: { select: { cards: true } },
      },
      // include: {
      //   cards: {
      //     include: {
      //       cardType: {
      //         include: {
      //           fields: true,
      //         },
      //       },
      //       values: {
      //         include: {
      //           field: true,
      //         },
      //       },
      //     },
      //     orderBy: { createdAt: 'desc' },
      //   },
      //   _count: { select: { cards: true } },
      // },
    });
    if (!collection)
      throw new NotFoundException(ErrorCode.COLLECTION_NOT_FOUND);
    return collection;
  }

  async createCollection(
    userId: string,
    dto: CreateCollectionDto,
  ): Promise<CreateCollectionResponseDto> {
    const collection = await this.prisma.cardCollection.create({
      data: { ...dto, userId },
    });
    return collection;
  }

  async updateCollection(
    id: string,
    userId: string,
    dto: UpdateCollectionDto,
  ): Promise<CreateCollectionResponseDto> {
    await this.findCollectionOrFail(id, userId);
    const collection = await this.prisma.cardCollection.update({
      where: { id },
      data: dto,
    });
    return collection;
  }

  async deleteCollection(
    id: string,
    userId: string,
  ): Promise<DeleteResponseDto> {
    await this.findCollectionOrFail(id, userId);
    await this.prisma.cardCollection.delete({ where: { id } });
    return {
      id,
    };
  }

  async searchCollections(
    userId: string,
    page = 1,
    limit = 10,
    query?: string,
  ): Promise<CollectionSearchResponseDto> {
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      deletedAt: null,
    };

    const blockerIds = await this.userService.getBlockerIdsOf(userId);

    if (blockerIds.length > 0) {
      where.userId = {
        notIn: blockerIds,
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    let [searchedCollections, total] = await Promise.all([
      this.prisma.cardCollection.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,

        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          isPublic: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          _count: { select: { cards: true } },
        },
      }),
      this.prisma.cardCollection.count({ where }),
    ]);

    return {
      collections: searchedCollections,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ──────────────────────────────────────────────
  // Cards
  // ──────────────────────────────────────────────

  async addCard(
    collectionId: string,
    userId: string,
    dto: CreateCardDto,
  ): Promise<AddCardResponseDto> {
    const targetCollectionId = collectionId || dto.cardCollectionId;
    if (!targetCollectionId) {
      throw new BadRequestException(ErrorCode.COLLECTION_ID_REQUIRED);
    }

    await this.findCollectionOrFail(targetCollectionId, userId);

    const cardType = await this.prisma.cardType.findFirst({
      where: { id: dto.cardTypeId, userId },
      include: {
        fields: true,
      },
    });

    if (!cardType) {
      throw new NotFoundException(ErrorCode.CARD_TYPE_NOT_FOUND);
    }

    // get cardFieldId that belongs to that cardType
    const validFieldIds = new Set(cardType.fields.map((f) => f.id));
    const cleanedValues = (dto.values ?? [])
      .map((item) => ({
        fieldId: item.fieldId,
        value: item.value?.trim() ?? '',
      }))
      .filter((item) => item.value.length > 0);

    const duplicateFieldIds = new Set<string>();
    const seenFieldIds = new Set<string>();
    for (const item of cleanedValues) {
      if (seenFieldIds.has(item.fieldId)) {
        duplicateFieldIds.add(item.fieldId);
      }
      seenFieldIds.add(item.fieldId);
    }

    if (duplicateFieldIds.size > 0) {
      throw new BadRequestException(ErrorCode.DUPLICATE_FIELD_DATA);
    }

    const invalidFieldExists = cleanedValues.some(
      (item) => !validFieldIds.has(item.fieldId),
    );
    if (invalidFieldExists) {
      throw new BadRequestException(ErrorCode.FIELD_NOT_IN_CARD_TYPE);
    }

    if (cleanedValues.length < 1) {
      throw new BadRequestException(ErrorCode.ALL_FIELDS_EMPTY);
    }

    const card = await this.prisma.card.create({
      data: {
        cardTypeId: cardType.id,
        cardCollectionId: targetCollectionId,
        values: {
          create: cleanedValues,
        },
      },
      include: {
        cardType: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        values: {
          include: {
            field: true,
          },
        },
      },
    });

    return card;
  }

  async updateCard(
    cardId: string,
    userId: string,
    dto: UpdateCardDto,
  ): Promise<UpdateCardResponseDto | null> {
    // 1. Kiểm tra quyền sở hữu
    const card = await this.prisma.card.findFirst({
      where: {
        id: cardId,
        cardCollection: { userId },
      },
    });

    if (!card) {
      throw new NotFoundException(ErrorCode.CARD_NOT_FOUND_OR_FORBIDDEN);
    }

    const updatedCard = await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật hoặc tạo mới các values
      if (dto.values && dto.values.length > 0) {
        await Promise.all(
          dto.values.map((val) =>
            tx.cardFieldValue.upsert({
              where: {
                cardId_fieldId: {
                  cardId: cardId,
                  fieldId: val.fieldId,
                },
              },
              create: {
                cardId: cardId,
                fieldId: val.fieldId,
                value: val.value,
              },
              update: {
                value: val.value,
              },
            }),
          ),
        );
      }

      // 2. Lấy đối tượng Card hoàn chỉnh sau khi cập nhật để trả về
      // Bao gồm cả cardType và values mới nhất
      return tx.card.findUnique({
        where: { id: cardId },
        include: {
          cardType: {
            include: { fields: true },
          },
          values: true,
        },
      });
    });

    return updatedCard;
  }

  async deleteCard(cardId: string, userId: string): Promise<DeleteResponseDto> {
    const card = await this.prisma.card.findFirst({
      where: {
        id: cardId,
        cardCollection: { userId },
      },
    });

    if (!card) {
      throw new NotFoundException(ErrorCode.CARD_NOT_FOUND_OR_FORBIDDEN);
    }

    await this.prisma.card.delete({
      where: { id: cardId },
    });

    return { id: cardId };
  }

  async importCards(
    collectionId: string,
    userId: string,
    dto: ImportCardsDto,
  ): Promise<ImportCardsResponseDto> {
    // validate
    await this.prisma.cardCollection.findUniqueOrThrow({
      where: { id: collectionId, userId },
    });

    await this.prisma.cardType.findUniqueOrThrow({
      where: { id: dto.cardTypeId, userId },
    });

    const rows = this.parseRawTextWithDelimiter(dto.rawText, dto.delimiter);

    // transaction
    const result = await this.prisma.$transaction(async (tx) => {
      let skipped = 0;
      let imported = 0;
      let updated = 0;
      let errors = 0;
      const importedCards: string[] = [];
      const skippedCards: string[] = [];
      const updatedCards: string[] = [];
      const errorLines: string[] = [];

      const cardFields = await tx.cardField.findMany({
        where: { cardTypeId: dto.cardTypeId },
        orderBy: { order: 'asc' },
      });

      if (cardFields.length === 0) {
        throw new BadRequestException(ErrorCode.CARD_TYPE_FIELDS_UNDEFINED);
      }

      for (const row of rows) {
        try {
          // Bỏ qua nếu dòng trống hoặc không có thông tin nhận dạng
          if (row.length === 0 || !row[0]?.trim()) {
            skipped++;
            continue;
          }

          // Kiểm tra trùng lặp (dựa trên trường đầu tiên)
          const existingCards = await tx.card.findMany({
            where: {
              cardCollectionId: collectionId,
              cardTypeId: dto.cardTypeId,
              values: {
                some: {
                  fieldId: cardFields[0].id,
                  value: row[0].trim(),
                },
              },
            },
            select: { id: true },
          });

          // Xử lý SKIP
          if (
            existingCards.length > 0 &&
            dto.duplicatePolicy === DuplicatePolicy.SKIP
          ) {
            skipped++;
            skippedCards.push(row.join(dto.delimiter));
            continue;
          }

          const cleanedValues = cardFields.map((field, index) => ({
            fieldId: field.id,
            value: row[index] || '', // Tránh lỗi undefined nếu dòng thiếu cột
          }));

          // Xử lý UPDATE
          if (
            existingCards.length > 0 &&
            dto.duplicatePolicy === DuplicatePolicy.UPDATE
          ) {
            for (const match of existingCards) {
              // Cập nhật song song các trường của một Thẻ
              await Promise.all(
                cleanedValues.map((val) =>
                  tx.cardFieldValue.update({
                    where: {
                      cardId_fieldId: {
                        cardId: match.id,
                        fieldId: val.fieldId,
                      },
                    },
                    data: { value: val.value },
                  }),
                ),
              );
            }
            updated++;
            updatedCards.push(row.join(dto.delimiter));
          } else {
            // Tạo mới (cho cả NEW và DUPLICATE)
            await tx.card.create({
              data: {
                cardCollectionId: collectionId,
                cardTypeId: dto.cardTypeId,
                values: {
                  create: cleanedValues,
                },
              },
            });
            imported++;
            importedCards.push(row.join(dto.delimiter));
          }
        } catch (e) {
          console.error('Import line error:', e);
          errors++;
          errorLines.push(row.join(dto.delimiter));
        }
      }

      return {
        imported: { count: imported, cards: importedCards },
        skipped: { count: skipped, cards: skippedCards },
        updated: { count: updated, cards: updatedCards },
        errors: { count: errors, lines: errorLines },
      };
    });

    return result;
  }

  // ──────────────────────────────────────────────
  // CardTypes
  // ──────────────────────────────────────────────

  async getCardTypes(userId: string): Promise<GetCardTypesResponseDto> {
    const cardTypes = await this.prisma.cardType.findMany({
      where: { userId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return { cardTypes };
  }

  async createCardType(
    userId: string,
    createCardTypeDto: CreateCardTypeDto,
  ): Promise<CreateCardTypeResponseDto | null> {
    const cardType = await this.prisma.cardType.create({
      data: {
        name: createCardTypeDto.name,
        description: createCardTypeDto.description || null,
        userId,
        fields: {
          create: createCardTypeDto.fields.map((field) => {
            const side = field.side
              ? String(field.side).toUpperCase()
              : 'FRONT';
            const fieldType = field.fieldType
              ? String(field.fieldType).toUpperCase()
              : 'TEXT';

            const parsedFontSize = field.fontSize
              ? parseInt(String(field.fontSize), 10)
              : null;
            const validFontSize =
              parsedFontSize && !isNaN(parsedFontSize) ? parsedFontSize : null;

            return {
              key:
                field.key || `field_${Math.random().toString(36).slice(2, 7)}`,
              label: field.label || 'New Field',
              fieldType: fieldType as any,
              side: side as any,
              order:
                typeof field.order === 'number' && !isNaN(field.order)
                  ? field.order
                  : 0,
              color: field.color || null,
              fontSize: validFontSize,
            };
          }),
        },
      },
    });

    // Sau khi tạo thành công, lấy lại với include và orderBy để trả về cho Frontend
    const result = await this.prisma.cardType.findUnique({
      where: { id: cardType.id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return result;
  }

  async getCardTypeById(
    id: string,
    userId: string,
  ): Promise<GetCardTypeByIdResponseDto> {
    const cardType = await this.prisma.cardType.findFirst({
      where: { id, userId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!cardType) {
      throw new NotFoundException(ErrorCode.CARD_TYPE_NOT_FOUND);
    }

    return cardType;
  }

  async updateCardType(
    id: string,
    userId: string,
    dto: Partial<CreateCardTypeDto>,
  ): Promise<CardTypeWithFieldsDto | null> {
    const existingType = await this.findCardTypeOrFail(id, userId);

    const cardType = await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật thông tin cơ bản của CardType
      await tx.cardType.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      // 2. Xử lý Fields nếu có truyền vào
      if (dto.fields) {
        // Lấy danh sách ID các field hiện có trong DB
        const currentFields = await tx.cardField.findMany({
          where: { cardTypeId: id },
          select: { id: true },
        });
        const currentFieldIds = currentFields.map((f) => f.id);

        // Danh sách ID từ DTO gửi lên (có cái có ID, có cái không - nếu là trường mới)
        const incomingFieldIds = dto.fields
          .map((f: any) => f.id)
          .filter((id) => !!id);

        // Xóa những field không còn trong danh sách mới
        const fieldsToDelete = currentFieldIds.filter(
          (fid) => !incomingFieldIds.includes(fid),
        );
        if (fieldsToDelete.length > 0) {
          await tx.cardField.deleteMany({
            where: { id: { in: fieldsToDelete } },
          });
        }

        // Cập nhật hoặc thêm mới từng field một cách an toàn
        for (const field of dto.fields) {
          const { id: fieldId, ...fieldData } = field as any;

          const parsedFontSize = fieldData.fontSize
            ? parseInt(String(fieldData.fontSize), 10)
            : null;
          const validFontSize =
            parsedFontSize && !isNaN(parsedFontSize) ? parsedFontSize : null;

          const cleanData = {
            key: fieldData.key,
            label: fieldData.label,
            fieldType: String(fieldData.fieldType).toUpperCase() as any,
            side: String(fieldData.side).toUpperCase() as any,
            order:
              typeof fieldData.order === 'number' && !isNaN(fieldData.order)
                ? fieldData.order
                : 0,
            color: fieldData.color || null,
            fontSize: validFontSize,
          };

          if (fieldId && currentFieldIds.includes(fieldId)) {
            await tx.cardField.update({
              where: { id: fieldId },
              data: cleanData,
            });
          } else {
            await tx.cardField.create({
              data: {
                ...cleanData,
                cardTypeId: id,
              },
            });
          }
        }
      }

      // Trả về CardType đã cập nhật kèm các trường đã sắp xếp
      return await tx.cardType.findUnique({
        where: { id },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    return cardType;
  }

  async deleteCardType(id: string, userId: string): Promise<DeleteResponseDto> {
    await this.findCardTypeOrFail(id, userId);
    await this.prisma.cardType.delete({ where: { id } });
    return { id };
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  private async findCollectionOrFail(id: string, userId: string) {
    const col = await this.prisma.cardCollection.findFirst({
      where: { id, userId },
    });
    if (!col)
      throw new NotFoundException(ErrorCode.CARD_NOT_FOUND_OR_FORBIDDEN);
    return col;
  }

  private async findCardTypeOrFail(id: string, userId: string) {
    const cardType = await this.prisma.cardType.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!cardType) {
      throw new NotFoundException(ErrorCode.CARD_NOT_FOUND_OR_FORBIDDEN);
    }

    return cardType;
  }

  private parseRawTextWithDelimiter(rawText: string, delimiter: string) {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  }
}
