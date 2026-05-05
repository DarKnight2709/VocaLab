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

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  // Collections
  // ──────────────────────────────────────────────

  async getCollections(userId: string) {
    const collections = await this.prisma.cardCollection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        userId: true,
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { collections };
  }

  async getCollectionById(id: string, userId: string) {
    const collection = await this.prisma.cardCollection.findFirst({
      where: { id, userId },
      include: {
        cards: {
          include: {
            cardType: {
              include: {
                fields: true,
              },
            },
            values: {
              include: {
                field: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { cards: true } },
      },
    });
    if (!collection) throw new NotFoundException('Không tìm thấy bộ từ vựng');
    return { collection };
  }

  async createCollection(userId: string, dto: CreateCollectionDto) {
    const collection = await this.prisma.cardCollection.create({
      data: { ...dto, userId },
    });
    return { message: 'Tạo bộ từ vựng thành công', collection };
  }

  async updateCollection(id: string, userId: string, dto: UpdateCollectionDto) {
    await this.findCollectionOrFail(id, userId);
    const collection = await this.prisma.cardCollection.update({
      where: { id },
      data: dto,
    });
    return { message: 'Cập nhật thành công', collection };
  }

  async deleteCollection(id: string, userId: string) {
    await this.findCollectionOrFail(id, userId);
    await this.prisma.cardCollection.delete({ where: { id } });
  }

  // ──────────────────────────────────────────────
  // Cards
  // ──────────────────────────────────────────────

  async addCard(collectionId: string, userId: string, dto: CreateCardDto) {
    const targetCollectionId = collectionId || dto.cardCollectionId;
    if (!targetCollectionId) {
      throw new BadRequestException('Thiếu collectionId');
    }

    await this.findCollectionOrFail(targetCollectionId, userId);

    const cardType = await this.prisma.cardType.findFirst({
      where: { id: dto.cardTypeId, userId },
      include: {
        fields: true,
      },
    });

    if (!cardType) {
      throw new NotFoundException('Không tìm thấy kiểu thẻ');
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
      throw new BadRequestException('Dữ liệu field bị trùng');
    }

    const invalidFieldExists = cleanedValues.some(
      (item) => !validFieldIds.has(item.fieldId),
    );
    if (invalidFieldExists) {
      throw new BadRequestException('Có field không thuộc kiểu thẻ đã chọn');
    }

    if (cleanedValues.length < 1) {
      throw new BadRequestException('Tất cả các trường đều chưa được nhập.');
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

    return { message: 'Thêm từ thành công', card };
  }

  async updateCard(cardId: string, userId: string, dto: UpdateCardDto) {
    // 1. Kiểm tra quyền sở hữu
    const card = await this.prisma.card.findFirst({
      where: {
        id: cardId,
        cardCollection: { userId },
      },
    });

    if (!card) {
      throw new NotFoundException("Không tìm thấy thẻ hoặc bạn không có quyền");
    }

    // 2. Cập nhật dữ liệu
    return await this.prisma.$transaction(async (tx) => {
      // Cập nhật các trường dữ liệu (values)
      if (dto.values) {
        for (const val of dto.values) {
          await tx.cardFieldValue.upsert({
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
          });
        }
      }
      return { message: "Cập nhật thẻ thành công"};
    });
  }

  async deleteCard(cardId: string, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: {
        id: cardId,
        cardCollection: { userId },
      },
    });

    if (!card) {
      throw new NotFoundException("Không tìm thấy thẻ hoặc bạn không có quyền");
    }

    await this.prisma.card.delete({
      where: { id: cardId },
    });

    return { message: "Xóa thẻ thành công" };
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

  async importCards(collectionId: string, userId: string, dto: ImportCardsDto) {
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
        throw new BadRequestException('Kiểu thẻ này chưa được định nghĩa các trường dữ liệu');
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
          if (existingCards.length > 0 && dto.duplicatePolicy === DuplicatePolicy.SKIP) {
            skipped++;
            skippedCards.push(row.join(dto.delimiter));
            continue;
          }

          const cleanedValues = cardFields.map((field, index) => ({
            fieldId: field.id,
            value: row[index] || '', // Tránh lỗi undefined nếu dòng thiếu cột
          }));

          // Xử lý UPDATE
          if (existingCards.length > 0 && dto.duplicatePolicy === DuplicatePolicy.UPDATE) {
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

    return {
      message: `Hoàn tất xử lý ${rows.length} dòng`,
      summary: `Thêm mới: ${result.imported.count}, Cập nhật: ${result.updated.count}, Bỏ qua: ${result.skipped.count}, Lỗi: ${result.errors.count}`,
      ...result,
    };
  }

  // ──────────────────────────────────────────────
  // CardTypes
  // ──────────────────────────────────────────────

  async getCardTypes(userId: string) {
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

  async createCardType(userId: string, createCardTypeDto: CreateCardTypeDto) {
    const cardType = await this.prisma.cardType.create({
      data: {
        name: createCardTypeDto.name,
        description: createCardTypeDto.description || null,
        userId,
        fields: {
          create: createCardTypeDto.fields.map((field) => {
            const side = field.side ? String(field.side).toUpperCase() : 'FRONT';
            const fieldType = field.fieldType ? String(field.fieldType).toUpperCase() : 'TEXT';
            
            const parsedFontSize = field.fontSize ? parseInt(String(field.fontSize), 10) : null;
            const validFontSize = (parsedFontSize && !isNaN(parsedFontSize)) ? parsedFontSize : null;
            
            return {
              key: field.key || `field_${Math.random().toString(36).slice(2, 7)}`,
              label: field.label || 'New Field',
              fieldType: fieldType as any,
              side: side as any,
              order: (typeof field.order === 'number' && !isNaN(field.order)) ? field.order : 0,
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

    return { message: 'Tạo kiểu thẻ thành công', cardType: result };
  }

  async getCardTypeById(id: string, userId: string) {
    const cardType = await this.prisma.cardType.findFirst({
      where: { id, userId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!cardType) {
      throw new NotFoundException('Không tìm thấy kiểu thẻ');
    }

    return { cardType };
  }

  async updateCardType(
    id: string,
    userId: string,
    dto: Partial<CreateCardTypeDto>,
  ) {
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

          const parsedFontSize = fieldData.fontSize ? parseInt(String(fieldData.fontSize), 10) : null;
          const validFontSize = (parsedFontSize && !isNaN(parsedFontSize)) ? parsedFontSize : null;

          const cleanData = {
            key: fieldData.key,
            label: fieldData.label,
            fieldType: String(fieldData.fieldType).toUpperCase() as any,
            side: String(fieldData.side).toUpperCase() as any,
            order: (typeof fieldData.order === 'number' && !isNaN(fieldData.order)) ? fieldData.order : 0,
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
            orderBy: { order: "asc" },
          },
        },
      });
    });

    return { message: "Cập nhật kiểu thẻ thành công", cardType };
  }

  async deleteCardType(id: string, userId: string) {
    await this.findCardTypeOrFail(id, userId);
    await this.prisma.cardType.delete({ where: { id } });
    return { message: 'Đã xóa kiểu thẻ' };
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  private async findCollectionOrFail(id: string, userId: string) {
    const col = await this.prisma.cardCollection.findFirst({
      where: { id, userId },
    });
    if (!col)
      throw new NotFoundException(
        'Không tìm thấy bộ từ vựng hoặc bạn không có quyền truy cập',
      );
    return col;
  }

  private async findWordOrFail(wordId: string, userId: string) {
    // const word = await this.prisma.vocabWord.findFirst({
    //   where: { id: wordId, collection: { userId } },
    // });
    // if (!word)
    //   throw new NotFoundException(
    //     'Không tìm thấy từ hoặc bạn không có quyền truy cập',
    //   );
    // return word;
  }

  private async findCardTypeOrFail(id: string, userId: string) {
    const cardType = await this.prisma.cardType.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!cardType) {
      throw new NotFoundException(
        'Không tìm thấy kiểu thẻ hoặc bạn không có quyền truy cập',
      );
    }

    return cardType;
  }
}
