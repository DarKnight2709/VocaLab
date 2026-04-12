import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CreateCardTypeDto,
  CreateCardDto,
  ImportCardsDto,
  UpdateCardDto,
} from './dto/vocabulary.dto';
import { IsProtected } from '../../common/decorators/protected.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@IsProtected()
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  // ──────────────────────────────────────────────
  // Collections
  // ──────────────────────────────────────────────

  @Get('collections') //
  getCollections(@CurrentUser() user: any) {
    return this.vocabularyService.getCollections(user.id);
  }

  @Get('collections/:collectionId/cards')
  getCollectionCards(@Param('collectionId') id: string, @CurrentUser() user: any) {
    return this.vocabularyService.getCollectionById(id, user.id);
  }

  @Get('collections/:id')
  getCollectionDetail(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vocabularyService.getCollectionById(id, user.id);
  }

  @Post('collections') //
  createCollection(@CurrentUser() user: any, @Body() dto: CreateCollectionDto) {
    return this.vocabularyService.createCollection(user.id, dto);
  }

  @Patch('collections/:id')
  updateCollection(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.vocabularyService.updateCollection(id, user.id, dto);
  }

  @Delete('collections/:id') //
  deleteCollection(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vocabularyService.deleteCollection(id, user.id);
  }

  // ──────────────────────────────────────────────
  // Cards
  // ──────────────────────────────────────────────
  
  // Tạo card mới thuộc một collection cụ thể
  @Post('collections/:collectionId/cards')
  addCard(
    @Param('collectionId') collectionId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCardDto,
  ) {
    return this.vocabularyService.addCard(collectionId, user.id, dto);
  }

  // Import hàng loạt vào một collection
  @Post('collections/:collectionId/import')
  importCards(
    @Param('collectionId') collectionId: string,
    @CurrentUser() user: any,
    @Body() dto: ImportCardsDto,
  ) {
    return this.vocabularyService.importCards(collectionId, user.id, dto);
  }

  // Cập nhật card (dùng ID trực tiếp của card)
  @Patch('cards/:cardId')
  updateCard(
    @Param('cardId') cardId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCardDto,
  ) {
    return this.vocabularyService.updateCard(cardId, user.id, dto);
  }

  // Xóa card (dùng ID trực tiếp của card)
  @Delete('cards/:cardId')
  deleteCard(@Param('cardId') cardId: string, @CurrentUser() user: any) {
    return this.vocabularyService.deleteCard(cardId, user.id);
  }

  // ──────────────────────────────────────────────
  // CardType
  // ──────────────────────────────────────────────
  @Get('card-types')
  getCardTypes(@CurrentUser() user: any) {
    return this.vocabularyService.getCardTypes(user.id);
  }

  @Get('card-types/:id')
  getCardTypeById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vocabularyService.getCardTypeById(id, user.id);
  }

  @Post('card-types')
  createCardType(@CurrentUser() user: any, @Body() createCardTypeDto: CreateCardTypeDto) {
    return this.vocabularyService.createCardType(user.id, createCardTypeDto);
  }

  @Patch('card-types/:id')
  updateCardType(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: Partial<CreateCardTypeDto>,
  ) {
    return this.vocabularyService.updateCardType(id, user.id, dto);
  }

  @Delete('card-types/:id')
  deleteCardType(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vocabularyService.deleteCardType(id, user.id);
  }
}
