import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
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
} from './dto/vocabulary-response.dto';

@IsProtected()
@ApiTags('vocabulary')
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  // ──────────────────────────────────────────────
  // Collections
  // ──────────────────────────────────────────────

  @Get('collections')
  @ApiOperation({ summary: 'Lấy danh sách bộ từ vựng' })
  async getCollections(
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<GetCollectionsResponseDto>> {
    const result = await this.vocabularyService.getCollections(user.id);
    return { data: result };
  }

  @Get('collections/:collectionId/cards')
  @ApiOperation({ summary: 'Lấy danh sách thẻ của bộ từ vựng' })
  async getCollectionCards(
    @Param('collectionId') id: string,
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<GetCollectionByIdResponseDto>> {
    const result = await this.vocabularyService.getCollectionById(id, user.id);
    return { data: result };
  }

  @Get('collections/:id')
  @ApiOperation({ summary: 'Lấy chi tiết bộ từ vựng' })
  async getCollectionDetail(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<GetCollectionByIdResponseDto>> {
    const result = await this.vocabularyService.getCollectionById(id, user.id);
    return { data: result };
  }

  @Post('collections')
  @ApiOperation({ summary: 'Tạo bộ từ vựng mới' })
  async createCollection(
    @CurrentUser() user: any,
    @Body() dto: CreateCollectionDto,
  ): Promise<ResponseInterceptor<CreateCollectionResponseDto>> {
    const result = await this.vocabularyService.createCollection(user.id, dto);
    return { data: result };
  }

  @Patch('collections/:id')
  @ApiOperation({ summary: 'Cập nhật bộ từ vựng' })
  async updateCollection(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCollectionDto,
  ): Promise<ResponseInterceptor<CreateCollectionResponseDto>> {
    const result = await this.vocabularyService.updateCollection(
      id,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Delete('collections/:id')
  @ApiOperation({ summary: 'Xóa bộ từ vựng' })
  async deleteCollection(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<DeleteResponseDto>> {
    const result = await this.vocabularyService.deleteCollection(id, user.id);
    return {
      data: result,
    };
  }

  // ──────────────────────────────────────────────
  // Cards
  // ──────────────────────────────────────────────

  @Post('collections/:collectionId/cards')
  @ApiOperation({ summary: 'Tạo thẻ mới trong bộ từ vựng' })
  async addCard(
    @Param('collectionId') collectionId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCardDto,
  ): Promise<ResponseInterceptor<AddCardResponseDto>> {
    const result = await this.vocabularyService.addCard(
      collectionId,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Post('collections/:collectionId/import')
  @ApiOperation({ summary: 'Import hàng loạt thẻ vào bộ từ vựng' })
  async importCards(
    @Param('collectionId') collectionId: string,
    @CurrentUser() user: any,
    @Body() dto: ImportCardsDto,
  ): Promise<ResponseInterceptor<ImportCardsResponseDto>> {
    const result = await this.vocabularyService.importCards(
      collectionId,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Patch('cards/:cardId')
  @ApiOperation({ summary: 'Cập nhật thẻ' })
  async updateCard(
    @Param('cardId') cardId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCardDto,
  ): Promise<ResponseInterceptor<UpdateCardResponseDto | null>> {
    const result = await this.vocabularyService.updateCard(
      cardId,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Delete('cards/:cardId')
  @ApiOperation({ summary: 'Xóa thẻ' })
  async deleteCard(
    @Param('cardId') cardId: string,
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<DeleteResponseDto>> {
    const result = await this.vocabularyService.deleteCard(cardId, user.id);
    return { data: result };
  }

  // ──────────────────────────────────────────────
  // CardType
  // ──────────────────────────────────────────────

  @Get('card-types')
  @ApiOperation({ summary: 'Lấy danh sách kiểu thẻ' })
  async getCardTypes(
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<GetCardTypesResponseDto>> {
    const result = await this.vocabularyService.getCardTypes(user.id);
    return { data: result };
  }

  @Get('card-types/:id')
  @ApiOperation({ summary: 'Lấy chi tiết kiểu thẻ' })
  async getCardTypeById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<GetCardTypeByIdResponseDto>> {
    const result = await this.vocabularyService.getCardTypeById(id, user.id);
    return { data: result };
  }

  @Post('card-types')
  @ApiOperation({ summary: 'Tạo kiểu thẻ mới' })
  async createCardType(
    @CurrentUser() user: any,
    @Body() createCardTypeDto: CreateCardTypeDto,
  ): Promise<ResponseInterceptor<CreateCardTypeResponseDto | null>> {
    const result = await this.vocabularyService.createCardType(
      user.id,
      createCardTypeDto,
    );
    return { data: result };
  }

  @Patch('card-types/:id')
  @ApiOperation({ summary: 'Cập nhật kiểu thẻ' })
  async updateCardType(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: Partial<CreateCardTypeDto>,
  ): Promise<ResponseInterceptor<CardTypeWithFieldsDto | null>> {
    const result = await this.vocabularyService.updateCardType(
      id,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Delete('card-types/:id')
  @ApiOperation({ summary: 'Xóa kiểu thẻ' })
  async deleteCardType(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<DeleteResponseDto>> {
    const result = await this.vocabularyService.deleteCardType(id, user.id);
    return { data: result };
  }
}
