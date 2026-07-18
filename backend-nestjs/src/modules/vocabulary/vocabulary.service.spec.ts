import { Test, TestingModule } from '@nestjs/testing';
import { VocabularyService } from './vocabulary.service';
import { PrismaService } from '../../core/database/prisma.service';
import { UserService } from '../users/users.service';
import { BlogService } from '../blog/blog.service';
import { BadRequestException } from '@nestjs/common';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { UpdateCardType } from '@/common/enums/update-card-type';
import { UpdateCard } from '@/common/enums/update-card';
import { ForkCollectionDto } from './dto/vocabulary.dto';
import { describe } from 'node:test';

describe('VocabularyService - forkCollection', () => {
  let service: VocabularyService;
  let prisma: any;

  const mockPrismaService = {
    cardCollection: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cardType: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    cardField: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cardFieldValue: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => {
      // Execute the callback passing the mocked prisma itself as tx
      return callback(mockPrismaService);
    }),
  };

  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService },
        { provide: BlogService, useValue: {} },
      ],
    }).compile();

    service = module.get<VocabularyService>(VocabularyService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forkCollection', () => {
    const userId = 'user-1';
    const originalCollectionId = 'orig-col-1';
    const dto: ForkCollectionDto = {
      name: 'My Forked Collection',
      description: 'Test description',
      isPublic: true,
      updateCardType: UpdateCardType.NEVER,
      updateCard: UpdateCard.NEVER,
      mergeCardType: false,
    };

    it('should throw BadRequestException if original collection is not found', async () => {
      prisma.cardCollection.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.forkCollection(userId, originalCollectionId, dto),
      ).rejects.toThrow(new BadRequestException(ErrorCode.COLLECTION_NOT_FOUND));

      expect(prisma.cardCollection.findFirst).toHaveBeenCalledWith({
        where: {
          id: originalCollectionId,
          isPublic: true,
          deletedAt: null,
        },
        include: expect.any(Object), // include is quite large, verifying presence is enough
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should create a completely new collection and card types when none exist', async () => {
      // Mock original collection deeply nested structure
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1',
            position: 1,
            cardType: {
              id: 'ctype-1',
              name: 'Basic Type',
              description: 'Basic desc',
              fields: [
                { id: 'f-1', key: 'term', label: 'Term', fieldType: 'TEXT', side: 'FRONT', order: 0 },
                { id: 'f-2', key: 'definition', label: 'Definition', fieldType: 'TEXT', side: 'BACK', order: 1 },
              ],
            },
            cardTypeId: 'ctype-1',
            values: [
              { id: 'val-1', fieldId: 'f-1', value: 'Hello', field: { key: 'term', order: 0 } },
              { id: 'val-2', fieldId: 'f-2', value: 'Xin chao', field: { key: 'definition', order: 1 } },
            ],
          },
        ],
      };

      // Mock finding original collection
      prisma.cardCollection.findFirst
        .mockResolvedValueOnce(mockOriginalCollection) // Top level findFirst
        .mockResolvedValueOnce(null); // Inside tx, finding existingCollection by name

      // Mock tx.cardType.findMany (userCardTypes) -> user has none
      prisma.cardType.findMany.mockResolvedValueOnce([]);
      
      // Mock tx.cardCollection.create
      const newCollection = { id: 'new-col-1', name: dto.name };
      prisma.cardCollection.create.mockResolvedValueOnce(newCollection);

      // Mock tx.cardType.create
      const newCardType = { id: 'new-ctype-1', name: 'Basic Type' };
      prisma.cardType.create.mockResolvedValueOnce(newCardType);

      // Mock tx.card.create
      const newCard = { id: 'new-card-1' };
      prisma.card.create.mockResolvedValueOnce(newCard);

      // Mock tx.cardType.findFirst (inside loop)
      prisma.cardType.findFirst.mockResolvedValueOnce({
        id: 'new-ctype-1',
        fields: [], // Assuming new fields are empty and we hit the `else` branch in cardType creation
      });

      // Mock tx.cardField.create
      prisma.cardField.create
        .mockResolvedValueOnce({ id: 'new-f-1' })
        .mockResolvedValueOnce({ id: 'new-f-2' });

      // Mock tx.cardFieldValue.create
      prisma.cardFieldValue.create
        .mockResolvedValueOnce({ id: 'new-val-1' })
        .mockResolvedValueOnce({ id: 'new-val-2' });

      // Mock tx.card.findMany (userExistingCards) -> user has no cards
      prisma.card.findMany.mockResolvedValueOnce([]);

      // Mock tx.cardFieldValue.findMany (origCardFieldValues for the card)
      prisma.cardFieldValue.findMany.mockResolvedValueOnce([
        { id: 'val-1', fieldId: 'f-1', value: 'Hello', field: { key: 'term', order: 0 } },
        { id: 'val-2', fieldId: 'f-2', value: 'Xin chao', field: { key: 'definition', order: 1 } },
      ]);

      // Mock tx.cardField.findMany (for card value creation)
      prisma.cardField.findMany.mockResolvedValueOnce([
        { id: 'new-f-1', key: 'term', cardTypeId: 'new-ctype-1' },
        { id: 'new-f-2', key: 'definition', cardTypeId: 'new-ctype-1' },
      ]);

      await service.forkCollection(userId, originalCollectionId, dto);

      expect(prisma.$transaction).toHaveBeenCalled();
      
      // Assert collection creation
      expect(prisma.cardCollection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          userId: userId,
          originId: originalCollectionId,
        }),
      });

      // Assert card type creation
      expect(prisma.cardType.create).toHaveBeenCalledWith({
        data: {
          name: 'Basic Type',
          description: 'Basic desc',
          userId: userId,
        },
      });

      // Assert card creation
      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          cardTypeId: 'new-ctype-1',
          cardCollectionId: 'new-col-1',
          position: 1,
          values: {
            create: [
              { fieldId: 'new-f-1', value: 'Hello' },
              { fieldId: 'new-f-2', value: 'Xin chao' }
            ]
          }
        },
      });

      // Assert fields creation
      expect(prisma.cardField.create).toHaveBeenCalledTimes(2);
      
      // Assert values creation
      expect(prisma.cardFieldValue.create).toHaveBeenCalledTimes(0);
    });

    it('should update an existing collection if a collection with the same name exists', async () => {
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [],
      };
      const existingCollection = { id: 'existing-col-1', name: dto.name };

      prisma.cardCollection.findFirst
        .mockResolvedValueOnce(mockOriginalCollection)
        .mockResolvedValueOnce(existingCollection);
      
      prisma.cardCollection.update.mockResolvedValueOnce({ ...existingCollection, description: dto.description });
      prisma.cardType.findMany.mockResolvedValueOnce([]);

      await service.forkCollection(userId, originalCollectionId, dto);

      expect(prisma.cardCollection.update).toHaveBeenCalledWith({
        where: { id: 'existing-col-1' },
        data: {
          description: dto.description,
          isPublic: dto.isPublic,
          originId: originalCollectionId,
        },
      });
      expect(prisma.cardCollection.create).not.toHaveBeenCalled();
    });

    it('should use existing card type and merge new fields if mergeCardType is true', async () => {
      const dtoWithMerge = { ...dto, mergeCardType: true };
      const originalCardType = {
        id: 'orig-ctype', name: 'Existing Type', description: 'desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Term' }, { id: 'f-2', key: 'newField', label: 'New Field' }],
        updatedAt: new Date(),
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [{ id: 'v-1', fieldId: 'f-1', value: 'Val1', field: { key: 'term', order: 0 } }],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      const existingCardType = { id: 'exist-ctype-1', name: 'Existing Type', updatedAt: new Date(Date.now() - 10000) };
      prisma.cardType.findMany.mockResolvedValueOnce([existingCardType]);

      const existingCardFields = [{ id: 'exist-f-1', key: 'term' }];
      prisma.cardField.findMany.mockResolvedValueOnce(existingCardFields);

      prisma.cardField.create.mockResolvedValueOnce({ id: 'new-exist-f-2' });

      // Card loop: userExistingCards (empty)
      prisma.card.findMany.mockResolvedValueOnce([]);

      // origCardFieldValues for the card
      prisma.cardFieldValue.findMany.mockResolvedValueOnce([]);

      // Create card + fields
      prisma.card.create.mockResolvedValueOnce({ id: 'new-card-1' });
      prisma.cardField.findMany.mockResolvedValueOnce([...existingCardFields, { id: 'new-exist-f-2', key: 'newField' }]);
      prisma.cardFieldValue.create.mockResolvedValue({});

      await service.forkCollection(userId, originalCollectionId, dtoWithMerge);

      expect(prisma.cardField.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cardTypeId: 'exist-ctype-1',
          key: 'newField',
          label: 'New Field',
        }),
      });
    });

    it('should update existing card type always if updateCardType is ALWAYS', async () => {
      const dtoWithUpdate = { ...dto, updateCardType: UpdateCardType.ALWAYS };
      const originalCardType = {
        id: 'orig-ctype', name: 'Existing Type', description: 'Updated Desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Updated Term', updatedAt: new Date() }],
        updatedAt: new Date(),
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [{ id: 'v-1', fieldId: 'f-1', value: 'Val1', field: { key: 'term', order: 0 } }],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      const existingCardType = { id: 'exist-ctype-1', name: 'Existing Type', description: 'Old Desc', updatedAt: new Date(Date.now() - 10000) };
      prisma.cardType.findMany.mockResolvedValueOnce([existingCardType]);
      const existingCardFields = [{ id: 'exist-f-1', key: 'term', label: 'Old Term', updatedAt: new Date(Date.now() - 10000) }];
      
      prisma.cardField.findMany
        .mockResolvedValueOnce(existingCardFields)
        .mockResolvedValueOnce(existingCardFields)
        .mockResolvedValueOnce(existingCardFields);

      prisma.cardType.update.mockResolvedValueOnce({});
      prisma.cardField.update.mockResolvedValueOnce({});
      
      // Card loop: userExistingCards (empty)
      prisma.card.findMany.mockResolvedValueOnce([]);

      // origCardFieldValues for the card
      prisma.cardFieldValue.findMany.mockResolvedValueOnce([]);

      // Create card + fields
      prisma.card.create.mockResolvedValueOnce({ id: 'new-card-1' });
      prisma.cardField.findMany.mockResolvedValueOnce(existingCardFields);

      await service.forkCollection(userId, originalCollectionId, dtoWithUpdate);

      expect(prisma.cardType.update).toHaveBeenCalledWith({
        where: { id: 'exist-ctype-1' },
        data: { description: 'Updated Desc' },
      });
      expect(prisma.cardField.update).toHaveBeenCalledWith({
        where: { id: 'exist-f-1' },
        data: expect.objectContaining({ label: 'Updated Term' }),
      });
    });

    it('should update existing card type if newer and updateCardType is IF_NEWER', async () => {
      const dtoWithUpdate = { ...dto, updateCardType: UpdateCardType.NEWER };
      const newDate = new Date();
      const oldDate = new Date(Date.now() - 10000);
      const originalCardType = {
        id: 'orig-ctype', name: 'Existing Type', description: 'Updated Desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Updated Term', updatedAt: newDate }],
        updatedAt: newDate,
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [{ id: 'v-1', fieldId: 'f-1', value: 'Val1', field: { key: 'term', order: 0 } }],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      const existingCardType = { id: 'exist-ctype-1', name: 'Existing Type', description: 'Old Desc', updatedAt: oldDate };
      prisma.cardType.findMany.mockResolvedValueOnce([existingCardType]);
      const existingCardFields = [{ id: 'exist-f-1', key: 'term', label: 'Old Term', updatedAt: oldDate }];
      
      prisma.cardField.findMany
        .mockResolvedValueOnce(existingCardFields)
        .mockResolvedValueOnce(existingCardFields)
        .mockResolvedValueOnce(existingCardFields);

      prisma.cardType.update.mockResolvedValueOnce({});
      prisma.cardField.update.mockResolvedValueOnce({});
      
      // Card loop: userExistingCards (empty)
      prisma.card.findMany.mockResolvedValueOnce([]);

      // origCardFieldValues for the card
      prisma.cardFieldValue.findMany.mockResolvedValueOnce([]);

      // Create card + fields
      prisma.card.create.mockResolvedValueOnce({ id: 'new-card-1' });
      prisma.cardField.findMany.mockResolvedValueOnce(existingCardFields);

      await service.forkCollection(userId, originalCollectionId, dtoWithUpdate);

      expect(prisma.cardType.update).toHaveBeenCalledWith({
        where: { id: 'exist-ctype-1' },
        data: { description: 'Updated Desc' },
      });
      expect(prisma.cardField.update).toHaveBeenCalledWith({
        where: { id: 'exist-f-1' },
        data: expect.objectContaining({ label: 'Updated Term' }),
      });
    });

    it('should update cards always if updateCard is ALWAYS and updateNeededCards > 0', async () => {
      const dtoWithUpdate = { ...dto, updateCard: UpdateCard.ALWAYS };
      const originalCardType = {
        id: 'orig-ctype', name: 'Existing Type', description: 'desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Term', updatedAt: new Date() }],
        updatedAt: new Date(),
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [
              { id: 'v-1', fieldId: 'f-1', value: 'OldVal1', field: { key: 'term', order: 0 } },
              { id: 'v-2', fieldId: 'f-2', value: 'NewDef', field: { key: 'def', order: 1 } }
            ],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      const existingCardType = { id: 'exist-ctype-1', name: 'Existing Type', updatedAt: new Date() };
      prisma.cardType.findMany.mockResolvedValueOnce([existingCardType]);
      const existingCardFields = [{ id: 'exist-f-1', key: 'term' }];
      prisma.cardField.findMany.mockResolvedValueOnce(existingCardFields);

      // Card loop: userExistingCards
      const updateNeededCards = [
        {
          id: 'exist-card-1',
          cardType: { name: 'Existing Type' },
          values: [
            { id: 'exist-v-1', value: 'OldVal1', field: { key: 'term', order: 0 } },
            { id: 'exist-v-2', value: 'OldDef', field: { key: 'def', order: 1 } }
          ]
        }
      ];
      prisma.card.findMany.mockResolvedValueOnce(updateNeededCards);

      // origCardFieldValues for the card
      const cardFieldValues = [
        { id: 'v-1', value: 'NewVal1', field: { key: 'term', order: 0, label: 'Term' } }
      ];
      prisma.cardFieldValue.findMany.mockResolvedValueOnce(cardFieldValues);

      prisma.cardFieldValue.update.mockResolvedValue({});

      await service.forkCollection(userId, originalCollectionId, dtoWithUpdate);

      expect(prisma.cardFieldValue.update).toHaveBeenCalledWith({
        where: { id: 'exist-v-2' },
        data: { value: 'NewDef' },
      });
      expect(prisma.card.create).not.toHaveBeenCalled();
    });

    it('should conditionally update existing cards if updateCard is IF_NEWER and updateNeededCards > 0', async () => {
      const dtoWithUpdate = { ...dto, updateCard: UpdateCard.NEWER };
      const newDate = new Date();
      const oldDate = new Date(Date.now() - 10000);
      const originalCardType = {
        id: 'orig-ctype', name: 'Existing Type', description: 'desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Term' }],
        updatedAt: new Date(),
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [
              { id: 'v-1', fieldId: 'f-1', value: 'OldVal1', updatedAt: oldDate, field: { key: 'term', order: 0 } },
              { id: 'v-2', fieldId: 'f-2', value: 'NewDef', updatedAt: newDate, field: { key: 'def', order: 1 } }
            ],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      const existingCardType = { id: 'exist-ctype-1', name: 'Existing Type', updatedAt: new Date() };
      prisma.cardType.findMany.mockResolvedValueOnce([existingCardType]);
      const existingCardFields = [{ id: 'exist-f-1', key: 'term' }];
      prisma.cardField.findMany.mockResolvedValueOnce(existingCardFields);

      // Card loop: userExistingCards
      const updateNeededCards = [
        {
          id: 'exist-card-1',
          cardType: { name: 'Existing Type' },
          values: [
            { id: 'exist-v-1', value: 'OldVal1', updatedAt: newDate, field: { key: 'term', order: 0 } },
            { id: 'exist-v-2', value: 'OldDef', updatedAt: oldDate, field: { key: 'def', order: 1 } }
          ]
        }
      ];
      prisma.card.findMany.mockResolvedValueOnce(updateNeededCards);

      // origCardFieldValues for the card
      const cardFieldValues = [
        { id: 'v-1', value: 'NewVal1', updatedAt: newDate, field: { key: 'term', order: 0, label: 'Term' } }
      ];
      prisma.cardFieldValue.findMany.mockResolvedValueOnce(cardFieldValues);

      prisma.cardFieldValue.update.mockResolvedValue({});

      await service.forkCollection(userId, originalCollectionId, dtoWithUpdate);

      expect(prisma.cardFieldValue.update).toHaveBeenCalledWith({
        where: { id: 'exist-v-2' },
        data: { value: 'NewDef' },
      });
      expect(prisma.card.create).not.toHaveBeenCalled();
    });

    it('should use cached targetCardType and process existing cardType fields properly', async () => {
      const originalCardType = {
        id: 'orig-ctype', name: 'New Type', description: 'desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Term', fieldType: 'TEXT', side: 'FRONT', order: 0 }],
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [{ id: 'v-1', fieldId: 'f-1', value: 'Val1', field: { key: 'term', order: 0 } }],
          },
          {
            id: 'card-2', position: 2, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [{ id: 'v-2', fieldId: 'f-1', value: 'Val2', field: { key: 'term', order: 0 } }],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      prisma.cardType.findMany.mockResolvedValueOnce([]);

      // Card type loop: only creates one card type + its fields
      prisma.cardType.create.mockResolvedValueOnce({ id: 'new-ctype-1', name: 'New Type' });
      prisma.cardType.findFirst.mockResolvedValueOnce({ id: 'new-ctype-1', fields: [] });
      prisma.cardField.create.mockResolvedValueOnce({ id: 'new-f-1' });

      // Card loop: userExistingCards (empty)
      prisma.card.findMany.mockResolvedValueOnce([]);

      // Card 1: origCardFieldValues, card.create, cardField.findMany, cardFieldValue.create
      prisma.cardFieldValue.findMany.mockResolvedValueOnce([
        { id: 'v-1', fieldId: 'f-1', value: 'Val1', field: { key: 'term', order: 0 } },
      ]);
      prisma.card.create.mockResolvedValueOnce({ id: 'new-card-1' });
      prisma.cardField.findMany.mockResolvedValueOnce([{ id: 'new-f-1', key: 'term' }]);
      prisma.cardFieldValue.create.mockResolvedValueOnce({ id: 'new-v-1' });

      // Card 2: origCardFieldValues, card.create, cardField.findMany, cardFieldValue.create
      prisma.cardFieldValue.findMany.mockResolvedValueOnce([
        { id: 'v-2', fieldId: 'f-1', value: 'Val2', field: { key: 'term', order: 0 } },
      ]);
      prisma.card.create.mockResolvedValueOnce({ id: 'new-card-2' });
      prisma.cardField.findMany.mockResolvedValueOnce([{ id: 'new-f-1', key: 'term' }]);
      prisma.cardFieldValue.create.mockResolvedValueOnce({ id: 'new-v-2' });

      await service.forkCollection(userId, originalCollectionId, dto);

      expect(prisma.cardType.create).toHaveBeenCalledTimes(1);
      expect(prisma.card.create).toHaveBeenCalledTimes(2);
      expect(prisma.cardField.create).toHaveBeenCalledTimes(1);
      expect(prisma.cardFieldValue.create).toHaveBeenCalledTimes(0);
    });

    it('should NOT update existing card type if not newer and updateCardType is NEWER', async () => {
      const dtoWithUpdate = { ...dto, updateCardType: UpdateCardType.NEWER };
      const newDate = new Date();
      const oldDate = new Date(Date.now() - 10000);
      const originalCardType = {
        id: 'orig-ctype', name: 'Existing Type', description: 'Updated Desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Updated Term', updatedAt: oldDate }],
        updatedAt: oldDate,
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [{ id: 'v-1', fieldId: 'f-1', value: 'Val1', field: { key: 'term' } }],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      const existingCardType = { id: 'exist-ctype-1', name: 'Existing Type', description: 'Old Desc', updatedAt: newDate };
      prisma.cardType.findMany.mockResolvedValueOnce([existingCardType]);
      const existingCardFields = [{ id: 'exist-f-1', key: 'term', label: 'Old Term', updatedAt: newDate }];
      
      prisma.cardField.findMany
        .mockResolvedValueOnce(existingCardFields)
        .mockResolvedValueOnce(existingCardFields)
        .mockResolvedValueOnce(existingCardFields);

      // Card loop: userExistingCards (empty)
      prisma.card.findMany.mockResolvedValueOnce([]);

      // origCardFieldValues for the card
      prisma.cardFieldValue.findMany.mockResolvedValueOnce([]);

      // Create card + fields
      prisma.card.create.mockResolvedValueOnce({ id: 'new-card-1' });
      prisma.cardField.findMany.mockResolvedValueOnce([{ id: 'exist-f-1', key: 'term' }]);

      await service.forkCollection(userId, originalCollectionId, dtoWithUpdate);

      expect(prisma.cardType.update).not.toHaveBeenCalled();
      expect(prisma.cardField.update).not.toHaveBeenCalled();
    });

    it('should NOT conditionally update existing cards if not newer and updateCard is NEWER and updateNeededCards > 0', async () => {
      const dtoWithUpdate = { ...dto, updateCard: UpdateCard.NEWER };
      const newDate = new Date();
      const oldDate = new Date(Date.now() - 10000);
      const originalCardType = {
        id: 'orig-ctype', name: 'Existing Type', description: 'desc',
        fields: [{ id: 'f-1', key: 'term', label: 'Term' }],
        updatedAt: new Date(),
      };
      const mockOriginalCollection = {
        id: originalCollectionId,
        cards: [
          {
            id: 'card-1', position: 1, cardTypeId: 'orig-ctype', cardType: originalCardType,
            values: [{ id: 'v-1', fieldId: 'f-1', value: 'OldVal1', field: { key: 'term', order: 0 } }],
          },
        ],
      };
      
      prisma.cardCollection.findFirst.mockResolvedValueOnce(mockOriginalCollection).mockResolvedValueOnce(null);
      prisma.cardCollection.create.mockResolvedValueOnce({ id: 'new-col-1' });

      const existingCardType = { id: 'exist-ctype-1', name: 'Existing Type', updatedAt: new Date() };
      prisma.cardType.findMany.mockResolvedValueOnce([existingCardType]);
      const existingCardFields = [{ id: 'exist-f-1', key: 'term' }];
      prisma.cardField.findMany.mockResolvedValueOnce(existingCardFields);

      // Card loop: userExistingCards
      const updateNeededCards = [
        {
          id: 'exist-card-1',
          cardType: { name: 'Existing Type' },
          values: [
            { id: 'exist-v-1', value: 'OldVal1', updatedAt: newDate, field: { key: 'term', order: 0 } }
          ]
        }
      ];
      prisma.card.findMany.mockResolvedValueOnce(updateNeededCards);

      // origCardFieldValues for the card
      const cardFieldValues = [
        { id: 'v-1', value: 'NewVal1', updatedAt: oldDate, field: { key: 'term', order: 0, label: 'Term' } }
      ];
      prisma.cardFieldValue.findMany.mockResolvedValueOnce(cardFieldValues);

      await service.forkCollection(userId, originalCollectionId, dtoWithUpdate);

      expect(prisma.cardFieldValue.update).not.toHaveBeenCalled();
      expect(prisma.card.create).not.toHaveBeenCalled();
    });
  });
});
