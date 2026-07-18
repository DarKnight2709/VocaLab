import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CreateCardDto,
  UpdateCardDto,
  ImportCardsDto,
  CreateCardTypeDto,
  ForkCollectionDto,
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
  ForkCollectionResponseDto,
  GetCollectionByIdPublicResponseDto,
  CardDetailDto,
  ReviewCardResponseDto,
} from './dto/vocabulary-response.dto';
import { CollectionSearchFilters, SEARCH_SORT, SEARCH_TIME } from '../search/search.types';
import { UserService } from '../users/users.service';
import { GetUserCollectionsResponseDto } from '../users/dto/users-response.dto';
import { BlogService } from '../blog/blog.service';
import { UpdateCardType } from '@/common/enums/update-card-type';
import { UpdateCard } from '@/common/enums/update-card';
import { calculateSM2 } from '@/common/utils/srs.utils';
import { SrsRating } from '@/common/enums/srs-rating.enum';
import { PostVisibility } from '@/common/enums/post-visibility.enum';

const collectionDetailSelect = {
  id: true,
  name: true,
  description: true,
  userId: true,
  isPublic: true,
  originId: true,
  createdAt: true,
  updatedAt: true,
  origin: {
    select: {
      id: true,
      name: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatar: true,
    },
  },
  cards: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      position: true,
      cardTypeId: true,
      repetitions: true,
      interval: true,
      easeFactor: true,
      nextReviewDate: true,
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
};

@Injectable()
export class VocabularyService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly blogService: BlogService,
  ) {}

  async getUserCollections(
    profileUserId: string,
    requestingUserId?: string,
    page = 1,
    limit = 12,
    search?: string,
    visibility?: PostVisibility,
  ): Promise<GetUserCollectionsResponseDto> {
    const isOwner = profileUserId === requestingUserId;

    // Call userService.findById (already injected)
    const user = await this.userService.findById(profileUserId);
    if (!user) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);

    if (requestingUserId && requestingUserId !== profileUserId) {
      const blockedByTarget = await this.prisma.block.findFirst({
        where: {
          blockingId: profileUserId,
          blockedId: requestingUserId,
        },
      });
      if (blockedByTarget) {
        throw new ForbiddenException(ErrorCode.FORBIDDEN);
      }
    }

    const skip = (page - 1) * limit;

    const where: any = {
      userId: profileUserId,
      deletedAt: null,
    };

    if (!isOwner) {
      where.isPublic = true;
    } else if (visibility) {
      if (visibility === PostVisibility.PUBLIC) {
        where.isPublic = true;
      } else if (visibility === PostVisibility.PRIVATE) {
        where.isPublic = false;
      }
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [collections, total] = await Promise.all([
      this.prisma.cardCollection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, fullName: true, avatar: true } },
          _count: { select: { cards: true } },
        },
      }),
      this.prisma.cardCollection.count({ where }),
    ]);

    return {
      collections,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

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
        originId: true,
        origin: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { collections };
  }

  async getCollectionByIdPublic(
    id: string,
  ): Promise<GetCollectionByIdPublicResponseDto> {
    const collection = await this.prisma.cardCollection.findFirst({
      where: { id, isPublic: true },
      select: collectionDetailSelect,
    });
    if (!collection)
      throw new NotFoundException(ErrorCode.COLLECTION_NOT_FOUND);
    return collection;
  }

  async getCollectionById(
    id: string,
    userId: string,
  ): Promise<GetCollectionByIdResponseDto> {
    const collection = await this.prisma.cardCollection.findFirst({
      where: { id, userId },
      select: collectionDetailSelect,
    });
    if (!collection)
      throw new NotFoundException(ErrorCode.COLLECTION_NOT_FOUND);

    const now = new Date();
    const newCount = collection.cards.filter(c => c.repetitions === 0).length;
    const dueCount = collection.cards.filter(c => c.repetitions > 0 && c.nextReviewDate <= now).length;
    const totalCount = collection.cards.length;

    return {
      ...collection,
      newCount,
      dueCount,
      totalCount,
    };
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

  async forkCollection(
    userId: string,
    originalCollectionId: string,
    dto: ForkCollectionDto,
  ): Promise<ForkCollectionResponseDto> {
    const originalCollection = await this.prisma.cardCollection.findFirst({
      where: {
        id: originalCollectionId,
        isPublic: true,
        deletedAt: null,
      },
      include: {
        cards: {
          where: {
            deletedAt: null,
          },
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
        },
      },
    });
    if (!originalCollection) {
      throw new BadRequestException(ErrorCode.COLLECTION_NOT_FOUND);
    }

    return this.prisma.$transaction(async (tx) => {
      const existingCollection = await tx.cardCollection.findFirst({
        where: {
          name: dto.name,
          userId,
        },
      });

      let newCollection: any;
      if (existingCollection) {
        newCollection = await tx.cardCollection.update({
          where: {
            id: existingCollection.id,
          },
          data: {
            description: dto.description,
            isPublic: dto.isPublic,
            originId: originalCollectionId,
          },
        });
      } else {
        // Create a new collection
        newCollection = await tx.cardCollection.create({
          data: {
            name: dto.name,
            description: dto.description,
            isPublic: dto.isPublic,
            userId: userId,
            originId: originalCollectionId,
          },
        });
      }

      const userCardTypes = await tx.cardType.findMany({
        where: { userId },
        include: { fields: true },
      });
      const userAddedCardTypes = new Map<string, any>();

      //  Get unique card types from the original collection
      const originalCardTypes = Array.from(
        new Map(
          originalCollection.cards.map((c) => [c.cardType.id, c.cardType]),
        ).values(),
      );

      const typeIdMap = new Map<string, string>(); // OriginalTypeId -> NewTypeId
      const createdCards: string[] = [];
      const updatedCards: string[] = [];
      const skippedCards: string[] = [];

      // Clone the card type
      for (const origType of originalCardTypes) {
        const originalCardFields = origType.fields;

        // find the card type in the current user to create/merge/update
        const existingCardType = userCardTypes.find(
          (uct) => uct.name === origType.name,
        );

        if (!existingCardType) {
          let targetCardType;
          if (userAddedCardTypes.has(origType.id)) {
            targetCardType = userAddedCardTypes.get(origType.id);
          } else {
            // haven't had the cardType (done) -> create new cardType and new cardFields
            targetCardType = await tx.cardType.create({
              data: {
                name: origType.name,
                description: origType.description,
                userId: userId,
              },
            });
          }
          typeIdMap.set(origType.id, targetCardType.id);

          // create card fields
          // Use Promise.all to process all field creations concurrently
          const cardType = await tx.cardType.findFirst({
            where: {
              id: targetCardType.id,
            },
            include: {
              fields: true,
            },
          });

          if (cardType!.fields.length === 0) {
            await Promise.all(
              originalCardFields.map(async (cardField) => {
                const newCardField = await tx.cardField.create({
                  data: {
                    cardTypeId: targetCardType.id,
                    key: cardField.key,
                    label: cardField.label,
                    side: cardField.side,
                    order: cardField.order,
                    color: cardField.color,
                    fontSize: cardField.fontSize,
                  },
                });
              }),
            );
          }
        } else {
          // check mergeCardType (add the new field to existing card type)
          typeIdMap.set(origType.id, existingCardType.id);
          const existingCardFields = await tx.cardField.findMany({
            where: {
              cardTypeId: existingCardType.id,
            },
          });
          if (dto.mergeCardType) {
            const existingFields = existingCardFields.map((field) => field.key);
            for (const cardField of originalCardFields) {
              if (!existingFields.includes(cardField.key)) {
                const newCardField = await tx.cardField.create({
                  data: {
                    cardTypeId: existingCardType.id,
                    key: cardField.key,
                    label: cardField.label,
                    side: cardField.side,
                    order: cardField.order,
                    color: cardField.color,
                    fontSize: cardField.fontSize,
                  },
                });
              }
            }
          }

          if (dto.updateCardType !== UpdateCardType.NEVER) {
            if (dto.updateCardType === UpdateCardType.ALWAYS) {
              // update the card type
              await tx.cardType.update({
                where: {
                  id: existingCardType.id,
                },
                data: {
                  description: origType.description,
                },
              });

              // update card fields
              const existingCardFields = await tx.cardField.findMany({
                where: {
                  cardTypeId: existingCardType.id,
                },
              });
              for (const cardField of originalCardFields) {
                const existingField = existingCardFields.find(
                  (field) => field.key === cardField.key,
                );
                if (existingField) {
                  await tx.cardField.update({
                    where: {
                      id: existingField.id,
                    },
                    data: {
                      cardTypeId: existingCardType.id,
                      label: cardField.label,
                      side: cardField.side,
                      order: cardField.order,
                      color: cardField.color,
                      fontSize: cardField.fontSize,
                    },
                  });
                }
              }
            } else {
              // only update if the card type is newer version.
              if (origType.updatedAt > existingCardType.updatedAt) {
                await tx.cardType.update({
                  where: {
                    id: existingCardType.id,
                  },
                  data: {
                    description: origType.description,
                  },
                });
              }

              // update card fields
              const existingCardFields = await tx.cardField.findMany({
                where: {
                  cardTypeId: existingCardType.id,
                },
              });
              for (const cardField of originalCardFields) {
                const existingField = existingCardFields.find(
                  (field) => field.key === cardField.key,
                );
                if (existingField) {
                  if (cardField.updatedAt > existingField.updatedAt) {
                    await tx.cardField.update({
                      where: {
                        id: existingField.id,
                      },
                      data: {
                        cardTypeId: existingCardType.id,
                        label: cardField.label,
                        side: cardField.side,
                        order: cardField.order,
                        color: cardField.color,
                        fontSize: cardField.fontSize,
                      },
                    });
                  }
                }
              }
            }
          }
        }

        const userExistingCards = await tx.card.findMany({
          where: {
            cardCollection: {
              userId,
            },
          },
          include: {
            cardType: true,
            values: {
              include: {
                field: true,
              },
            },
          },
        });

        // Pre-fetch all relevant target card fields for creation
        const targetCardTypeIds = Array.from(typeIdMap.values());
        const allTargetCardFields = await tx.cardField.findMany({
          where: {
            cardTypeId: {
              in: targetCardTypeIds,
            },
          },
        });
        const cardFieldsByTypeId = new Map<string, any[]>();
        for (const field of allTargetCardFields) {
          if (!cardFieldsByTypeId.has(field.cardTypeId)) {
            cardFieldsByTypeId.set(field.cardTypeId, []);
          }
          cardFieldsByTypeId.get(field.cardTypeId)!.push(field);
        }

        const creationPromises: any[] = [];
        const updatePromises: any[] = [];

        const cardsWithOrigType = originalCollection.cards.filter(
          (c) => c.cardTypeId === origType.id,
        );
        for (const origCard of cardsWithOrigType) {
          const term = origCard.values.find((v) => v.field.order === 0)?.value;
          const cardFullText = [...origCard.values]
            .sort((a, b) => a.field.order - b.field.order)
            .map((v) => v.value)
            .filter(Boolean)
            .join(', ');

          const existingCards = userExistingCards.filter(
            (c) =>
              c.values.find((v) => v.field.order === 0)?.value === term &&
              c.cardType.name === origCard.cardType.name,
          );

          if (existingCards.length > 0 && dto.updateCard === UpdateCard.NEVER) {
            skippedCards.push(cardFullText || `card-${origCard.position}`);
          } else if (existingCards.length > 0) {
            // update card
            let updated = 0;
            const targetTypeId = typeIdMap.get(origCard.cardTypeId)!;
            const cardFields = cardFieldsByTypeId.get(targetTypeId) || [];

            if (dto.updateCard === UpdateCard.ALWAYS) {
              // always update existingCards with origCard
              for (const existingCard of existingCards) {
                for (const cardFieldValue of existingCard.values) {
                  const updateValue = origCard.values.find(
                    (value) => value.field.key === cardFieldValue.field.key,
                  );
                  if (updateValue) {
                    updatePromises.push(
                      tx.cardFieldValue.update({
                        where: {
                          id: cardFieldValue.id,
                        },
                        data: {
                          value: updateValue?.value || '',
                        },
                      }),
                    );
                    updated++;
                  }
                }

                // Create values for newly merged fields that the existing card doesn't have
                const existingFieldKeys = existingCard.values.map(
                  (v) => v.field.key,
                );
                for (const cardField of cardFields) {
                  if (!existingFieldKeys.includes(cardField.key)) {
                    const origValue = origCard.values.find(
                      (v) => v.field.key === cardField.key,
                    );
                    creationPromises.push(
                      tx.cardFieldValue.create({
                        data: {
                          cardId: existingCard.id,
                          fieldId: cardField.id,
                          value: origValue?.value || '',
                        },
                      }),
                    );
                    updated++;
                  }
                }
              }
            } else {
              // only update card if origCard is newer version
              for (const existingCard of existingCards) {
                for (const cardFieldValue of existingCard.values) {
                  const updateValue = origCard.values.find(
                    (value) =>
                      value.field.key === cardFieldValue.field.key &&
                      value.updatedAt > cardFieldValue.updatedAt,
                  );
                  if (updateValue) {
                    updatePromises.push(
                      tx.cardFieldValue.update({
                        where: {
                          id: cardFieldValue.id,
                        },
                        data: {
                          value: updateValue?.value || '',
                        },
                      }),
                    );
                    updated++;
                  }
                }

                // Create values for newly merged fields that the existing card doesn't have
                const existingFieldKeys = existingCard.values.map(
                  (v) => v.field.key,
                );
                for (const cardField of cardFields) {
                  if (!existingFieldKeys.includes(cardField.key)) {
                    const origValue = origCard.values.find(
                      (v) => v.field.key === cardField.key,
                    );
                    creationPromises.push(
                      tx.cardFieldValue.create({
                        data: {
                          cardId: existingCard.id,
                          fieldId: cardField.id,
                          value: origValue?.value || '',
                        },
                      }),
                    );
                    updated++;
                  }
                }
              }
            }
            if (updated > 0) {
              updatedCards.push(cardFullText || `card-${origCard.position}`);
            } else {
              skippedCards.push(cardFullText || `card-${origCard.position}`);
            }
          } else {
            // create card
            const targetTypeId = typeIdMap.get(origCard.cardTypeId)!;
            const cardFields = cardFieldsByTypeId.get(targetTypeId) || [];

            creationPromises.push(
              tx.card.create({
                data: {
                  cardTypeId: targetTypeId,
                  cardCollectionId: newCollection.id,
                  position: origCard.position,
                  values: {
                    create: cardFields.map((cardField) => {
                      const fieldValue = origCard.values.find(
                        (v) => cardField.key === v.field.key,
                      );
                      return {
                        fieldId: cardField.id,
                        value: fieldValue?.value || '',
                      };
                    }),
                  },
                },
              }),
            );
            createdCards.push(cardFullText || `card-${origCard.position}`);
          }
        }
        await Promise.all([...creationPromises, ...updatePromises]);
      }
      return {
        id: newCollection.id,
        name: newCollection.name,
        description: newCollection.description,
        isPublic: newCollection.isPublic,
        userId: newCollection.userId,
        createdAt: newCollection.createdAt,
        updatedAt: newCollection.updatedAt,
        createdCards,
        updatedCards,
        skippedCards,
      };
    });
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
    userId: string | null,
    page = 1,
    limit = 10,
    query?: string,
    filters?: CollectionSearchFilters,
  ): Promise<CollectionSearchResponseDto> {
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      deletedAt: null,
    };

    const blockerIds = userId ? await this.userService.getBlockerIdsOf(userId) : [];

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

    if (filters?.time && filters.time !== SEARCH_TIME.ALL) {
      const threshold = this.blogService.getDateThreshold(filters.time);
      if (threshold) {
        where.createdAt = { gte: threshold };
      }
    }

    if (filters?.languages && filters.languages.length > 0) {
      where.languages = { hasSome: filters.languages };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters?.sort) {
      if (filters.sort === SEARCH_SORT.OLDEST) {
        orderBy = { createdAt: 'asc' };
      } else if (filters.sort === SEARCH_SORT.POPULAR) {
        orderBy = { forks: { _count: 'desc' } };
      }
    }

    let [searchedCollections, total] = await Promise.all([
      this.prisma.cardCollection.findMany({
        where,
        orderBy,
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
          originId: true,
          origin: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
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

    await this.recordDailyActivity(userId, targetCollectionId, 'cardsAdded');

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

    const cardType = await this.prisma.cardType.findFirst({
      where: { id: card.cardTypeId, userId },
      include: {
        fields: true,
      },
    });

    if (!cardType) {
      throw new NotFoundException(ErrorCode.CARD_TYPE_NOT_FOUND);
    }

    // get cardFieldId that belongs to that cardType
    const validFieldIds = new Set(cardType.fields.map((f) => f.id));
    const cleanedValues = (dto.values ?? []).map((item) => ({
      fieldId: item.fieldId,
      value: item.value?.trim() ?? '',
    }));

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

    const updatedCard = await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật hoặc tạo mới các values
      if (cleanedValues && cleanedValues.length > 0) {
        await Promise.all(
          cleanedValues.map((val) =>
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

    await this.recordDailyActivity(userId, card.cardCollectionId, 'cardsUpdated');

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

    await this.recordDailyActivity(userId, card.cardCollectionId, 'cardsDeleted');

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
    const usedKeys = new Set<string>();

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

            const parsedFontSize = field.fontSize
              ? parseInt(String(field.fontSize), 10)
              : null;
            const validFontSize =
              parsedFontSize && !isNaN(parsedFontSize) ? parsedFontSize : null;

            return {
              key: this.generateUniqueKeyFromLabel(
                field.label || 'New Field',
                usedKeys,
              ),
              label: field.label || 'New Field',
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
        // Lấy danh sách ID các field hiện có trong DB (chưa bị xóa)
        const currentFields = await tx.cardField.findMany({
          where: { cardTypeId: id, deletedAt: null },
          select: { id: true, key: true },
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

        const usedKeys = new Set<string>(
          currentFields
            .filter((f) => !fieldsToDelete.includes(f.id))
            .map((f) => f.key),
        );
        if (fieldsToDelete.length > 0) {
          await tx.cardField.updateMany({
            where: { id: { in: fieldsToDelete } },
            data: { deletedAt: new Date() },
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
            label: fieldData.label,
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
                key: this.generateUniqueKeyFromLabel(
                  fieldData.label || 'New Field',
                  usedKeys,
                ),
                cardTypeId: id,
              },
            });
          }
        }
      }

      // Trả về CardType đã cập nhật kèm các trường đã sắp xếp (không lấy những trường đã bị xóa)
      return await tx.cardType.findUnique({
        where: { id },
        include: {
          fields: {
            where: { deletedAt: null },
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

  private generateUniqueKeyFromLabel(
    label: string,
    usedKeys: Set<string>,
  ): string {
    const baseKey =
      label
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '_') || 'field'; // Replace spaces with underscores

    let key = baseKey;
    let counter = 1;
    while (usedKeys.has(key)) {
      key = `${baseKey}_${counter}`;
      counter++;
    }

    usedKeys.add(key);
    return key;
  }

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

  async getDueCards(
    collectionId: string,
    userId: string,
  ): Promise<CardDetailDto[]> {
    const collection = await this.prisma.cardCollection.findFirst({
      where: { id: collectionId, userId },
      select: { id: true },
    });
    if (!collection)
      throw new NotFoundException(ErrorCode.COLLECTION_NOT_FOUND);

    const now = new Date();

    const cards = await this.prisma.card.findMany({
      where: {
        cardCollectionId: collectionId,
        deletedAt: null,
        OR: [
          { repetitions: 0 },
          { nextReviewDate: { lte: now } },
        ],
      },
      select: {
        id: true,
        position: true,
        cardTypeId: true,
        repetitions: true,
        interval: true,
        easeFactor: true,
        nextReviewDate: true,
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
                side: true,
                order: true,
                color: true,
                fontSize: true,
              },
            },
          },
        },
      },
      orderBy: [
        { nextReviewDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return cards;
  }

  async reviewCard(
    cardId: string,
    userId: string,
    rating: SrsRating,
  ): Promise<ReviewCardResponseDto> {
    const card = await this.prisma.card.findFirst({
      where: {
        id: cardId,
        deletedAt: null,
        cardCollection: {
          userId,
        },
      },
      select: {
        id: true,
        repetitions: true,
        interval: true,
        easeFactor: true,
        nextReviewDate: true,
        cardCollectionId: true,
      },
    });

    if (!card) {
      throw new NotFoundException(ErrorCode.CARD_NOT_FOUND_OR_FORBIDDEN);
    }

    const result = calculateSM2(rating, {
      repetitions: card.repetitions,
      interval: card.interval,
      easeFactor: card.easeFactor,
    });

    const updatedCard = await this.prisma.card.update({
      where: { id: card.id },
      data: {
        repetitions: result.repetitions,
        interval: result.interval,
        easeFactor: result.easeFactor,
        nextReviewDate: result.nextReviewDate,
      },
      select: {
        id: true,
        repetitions: true,
        interval: true,
        easeFactor: true,
        nextReviewDate: true,
      },
    });

    await this.recordDailyActivity(userId, card.cardCollectionId, 'cardsReviewed');

    return updatedCard;
  }

  private async recordDailyActivity(
    userId: string,
    collectionId: string,
    activityType: 'cardsAdded' | 'cardsUpdated' | 'cardsDeleted' | 'cardsReviewed'
  ) {
    const today = new Date().toISOString().split('T')[0];
    const updateData = { [activityType]: { increment: 1 } };
    
    try {
      await Promise.all([
        this.prisma.dailyProgress.upsert({
          where: { userId_date: { userId, date: today } },
          update: updateData,
          create: {
            userId,
            date: today,
            [activityType]: 1,
          },
        }),
        this.prisma.collectionDailyProgress.upsert({
          where: { collectionId_date: { collectionId, date: today } },
          update: updateData,
          create: {
            userId,
            collectionId,
            date: today,
            [activityType]: 1,
          },
        })
      ]);
    } catch (error) {
      console.error('[recordDailyActivity] Failed:', { userId, collectionId, activityType, error });
    }
  }
}
