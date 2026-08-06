import type { RequestUser } from '@/common/types';
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
  CreateCardTypeDto,
  CreateCardDto,
  ImportCardsDto,
  UpdateCardDto,
  ForkCollectionDto,
  ReviewCardDto,
} from './dto/vocabulary.dto';
import { IsProtected } from '../../common/decorators/protected.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import {
  CreateCollectionResponseDto,
  ForkCollectionResponseDto,
  ImportCardsResponseDto,
  CardTypeWithFieldsDto,
  CardDetailDto,
  ReviewCardResponseDto,
  CollectionByIdResponseDto,
  CollectionItemDto,
  PublicCollectionResponseDto,
  CardTypesResponseDto,
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
    @CurrentUser() user: RequestUser,
  ): Promise<ResponseInterceptor<CollectionItemDto[]>> {
    const result = await this.vocabularyService.getCollections(user.id);
    return { data: result };
  }

  @Get('collections/:id/public')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bộ từ vựng công khai' })
  async getPublicCollectionById(
    @Param('id') id: string,
  ): Promise<ResponseInterceptor<PublicCollectionResponseDto>> {
    const result = await this.vocabularyService.getCollectionByIdPublic(id);
    return { data: result };
  }

  @Get('collections/:id')
  @ApiOperation({ summary: 'Lấy chi tiết bộ từ vựng' })
  async getCollectionDetail(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ResponseInterceptor<CollectionByIdResponseDto>> {
    const result = await this.vocabularyService.getCollectionById(id, user.id);
    return { data: result };
  }

  @Post('collections')
  @ApiOperation({ summary: 'Tạo bộ từ vựng mới' })
  async createCollection(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCollectionDto,
  ): Promise<ResponseInterceptor<CreateCollectionResponseDto>> {
    const result = await this.vocabularyService.createCollection(user.id, dto);
    return { data: result };
  }

  @Patch('collections/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin bộ từ vựng' })
  async updateCollection(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCollectionDto,
  ): Promise<ResponseInterceptor<CreateCollectionResponseDto>> {
    const result = await this.vocabularyService.updateCollection(
      id,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Post('collections/:id/fork')
  @ApiOperation({ summary: 'Fork bộ từ vựng' })
  async forkCollection(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ForkCollectionDto,
  ): Promise<ResponseInterceptor<ForkCollectionResponseDto>> {
    const result = await this.vocabularyService.forkCollection(
      user.id,
      id,
      dto,
    );
    return { data: result };
  }

  @Delete('collections/:id')
  @ApiOperation({ summary: 'Xóa bộ từ vựng' })
  async deleteCollection(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.vocabularyService.deleteCollection(id, user.id);
  }

  // ──────────────────────────────────────────────
  // Cards
  // ──────────────────────────────────────────────
  @Post('collections/:id/card')
  @ApiOperation({ summary: 'Thêm thẻ mới vào bộ từ vựng' })
  async addCard(
    @Param('id') collectionId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCardDto,
  ): Promise<ResponseInterceptor<CardDetailDto>> {
    const result = await this.vocabularyService.addCard(
      collectionId,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Post('collections/:id/import')
  @ApiOperation({ summary: 'Import hàng loạt thẻ vào bộ từ vựng' })
  async importCards(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ImportCardsDto,
  ): Promise<ResponseInterceptor<ImportCardsResponseDto>> {
    const result = await this.vocabularyService.importCards(
      id,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Patch('cards/:id')
  @ApiOperation({ summary: 'Cập nhật thẻ' })
  async updateCard(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateCardDto,
  ): Promise<ResponseInterceptor<CardDetailDto | null>> {
    const result = await this.vocabularyService.updateCard(
      id,
      user.id,
      dto,
    );
    return { data: result };
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Xóa thẻ' })
  async deleteCard(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.vocabularyService.deleteCard(id, user.id);
  }

  // ──────────────────────────────────────────────
  // CardType
  // ──────────────────────────────────────────────
  @Get('card-types')
  @ApiOperation({ summary: 'Lấy danh sách kiểu thẻ' })
  async getCardTypes(
    @CurrentUser() user: RequestUser,
  ): Promise<ResponseInterceptor<CardTypesResponseDto>> {
    const result = await this.vocabularyService.getCardTypes(user.id);
    return { data: result };
  }

  @Get('card-types/:id')
  @ApiOperation({ summary: 'Lấy chi tiết kiểu thẻ' })
  async getCardTypeById(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ResponseInterceptor<CardTypeWithFieldsDto>> {
    const result = await this.vocabularyService.getCardTypeById(id, user.id);
    return { data: result };
  }

  @Post('card-types')
  @ApiOperation({ summary: 'Tạo kiểu thẻ mới' })
  async createCardType(
    @CurrentUser() user: RequestUser,
    @Body() createCardTypeDto: CreateCardTypeDto,
  ): Promise<ResponseInterceptor<CardTypeWithFieldsDto | null>> {
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
    @CurrentUser() user: RequestUser,
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
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.vocabularyService.deleteCardType(id, user.id);
  }

  // ──────────────────────────────────────────────
  // Spaced Repetition (SRS)
  // ──────────────────────────────────────────────

  @Get('collections/:id/due')
  @ApiOperation({ summary: 'Lấy danh sách thẻ cần học/ôn tập theo SRS' })
  async getDueCards(
    @Param('id') collectionId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ResponseInterceptor<CardDetailDto[]>> {
    const result = await this.vocabularyService.getDueCards(
      collectionId,
      user.id,
    );
    return { data: result };
  }

  @Post('cards/:id/review')
  @ApiOperation({ summary: 'Đánh giá ôn tập thẻ theo SRS (SM-2)' })
  async reviewCard(
    @Param('id') cardId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ReviewCardDto,
  ): Promise<ResponseInterceptor<ReviewCardResponseDto>> {
    const result = await this.vocabularyService.reviewCard(
      cardId,
      user.id,
      dto.rating,
    );
    return { data: result };
  }
}
