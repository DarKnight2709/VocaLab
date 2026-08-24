import type { RequestUser } from '@/common/types';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  SerializeOptions,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { VocabularyService } from './vocabulary.service';
import { AnkiImporterService } from './services/anki-importer.service';
import {
  CreateCollectionDto,
  CreateCardTypeDto,
  CreateCardDto,
  ImportCardsDto,
  UpdateCardDto,
  ForkCollectionDto,
  ReviewCardDto,
  UpdateCollectionDto,
  DeleteManyCardsDto,
} from './dto/vocabulary.dto';
import { IsProtected } from '../../common/decorators/protected.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
  ImportAnkiResponseDto,
} from './dto/vocabulary-response.dto';

@IsProtected()
@ApiTags('vocabulary')
@Controller('vocabulary')
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
    private readonly ankiImporterService: AnkiImporterService,
  ) {}

  // ──────────────────────────────────────────────
  // Collections
  // ──────────────────────────────────────────────

  @Get('collections')
  @ApiOperation({ summary: 'Lấy danh sách bộ từ vựng' })
  @SerializeOptions({ type: CollectionItemDto, excludeExtraneousValues: true })
  async getCollections(
    @CurrentUser() user: RequestUser,
  ): Promise<CollectionItemDto[]> {
    const result = await this.vocabularyService.getCollections(user.id);
    return result;
  }

  @Get('collections/:id/public')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bộ từ vựng công khai' })
  @SerializeOptions({ type: PublicCollectionResponseDto, excludeExtraneousValues: true })
  async getPublicCollectionById(
    @Param('id') id: string,
  ): Promise<PublicCollectionResponseDto> {
    const result = await this.vocabularyService.getCollectionByIdPublic(id);
    return result;
  }

  @Get('collections/:id')
  @ApiOperation({ summary: 'Lấy chi tiết bộ từ vựng' })
  @SerializeOptions({ type: CollectionByIdResponseDto, excludeExtraneousValues: true })
  async getCollectionDetail(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<CollectionByIdResponseDto> {
    const result = await this.vocabularyService.getCollectionById(id, user.id);
    return result;
  }

  @Post('collections')
  @ApiOperation({ summary: 'Tạo bộ từ vựng mới' })
  @SerializeOptions({ type: CreateCollectionResponseDto, excludeExtraneousValues: true })
  async createCollection(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCollectionDto,
  ): Promise<CreateCollectionResponseDto> {
    const result = await this.vocabularyService.createCollection(user.id, dto);
    return result;
  }

  @Patch('collections/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin bộ từ vựng' })
  @SerializeOptions({ type: CreateCollectionResponseDto, excludeExtraneousValues: true })
  async updateCollection(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateCollectionDto,
  ): Promise<CreateCollectionResponseDto> {
    const result = await this.vocabularyService.updateCollection(
      id,
      user.id,
      dto,
    );
    return result;
  }

  @Post('collections/:id/fork')
  @ApiOperation({ summary: 'Fork bộ từ vựng' })
  @SerializeOptions({ type: ForkCollectionResponseDto, excludeExtraneousValues: true })
  async forkCollection(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ForkCollectionDto,
  ): Promise<ForkCollectionResponseDto> {
    const result = await this.vocabularyService.forkCollection(
      user.id,
      id,
      dto,
    );
    return result;
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
  @SerializeOptions({ type: CardDetailDto, excludeExtraneousValues: true })
  async addCard(
    @Param('id') collectionId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCardDto,
  ): Promise<CardDetailDto> {
    const result = await this.vocabularyService.addCard(
      collectionId,
      user.id,
      dto,
    );
    return result;
  }

  @Post('collections/:id/import')
  @ApiOperation({ summary: 'Import hàng loạt thẻ vào bộ từ vựng' })
  @SerializeOptions({ type: ImportCardsResponseDto, excludeExtraneousValues: true })
  async importCards(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ImportCardsDto,
  ): Promise<ImportCardsResponseDto> {
    const result = await this.vocabularyService.importCards(
      id,
      user.id,
      dto,
    );
    return result;
  }

  @Post('collections/import/anki')
  @ApiOperation({ summary: 'Import bộ thẻ từ file Anki (.apkg)' })
  @ApiConsumes('multipart/form-data')
  @SerializeOptions({ type: ImportAnkiResponseDto, excludeExtraneousValues: true })
  @UseInterceptors(FileInterceptor('file'))
  async importAnki(
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
  ): Promise<ImportAnkiResponseDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file .apkg để import');
    }
    const result = await this.ankiImporterService.importAnkiPackage(
      file.buffer,
      user.id,
      name,
    );
    return result;
  }

  @Patch('cards/:id')
  @ApiOperation({ summary: 'Cập nhật thẻ' })
  @SerializeOptions({ type: CardDetailDto, excludeExtraneousValues: true })
  async updateCard(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateCardDto,
  ): Promise<CardDetailDto | null> {
    const result = await this.vocabularyService.updateCard(
      id,
      user.id,
      dto,
    );
    return result;
  }

  @Delete('cards/bulk')
  @ApiOperation({ summary: 'Xóa nhiều thẻ' })
  async deleteManyCards(
    @CurrentUser() user: RequestUser,
    @Body() dto: DeleteManyCardsDto,
  ): Promise<void> {
    await this.vocabularyService.deleteManyCards(dto.cardIds, user.id);
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
  @SerializeOptions({ type: CardTypesResponseDto, excludeExtraneousValues: true })
  async getCardTypes(
    @CurrentUser() user: RequestUser,
  ): Promise<CardTypesResponseDto> {
    const result = await this.vocabularyService.getCardTypes(user.id);
    return result;
  }

  @Get('card-types/:id')
  @ApiOperation({ summary: 'Lấy chi tiết kiểu thẻ' })
  @SerializeOptions({ type: CardTypeWithFieldsDto, excludeExtraneousValues: true })
  async getCardTypeById(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<CardTypeWithFieldsDto> {
    const result = await this.vocabularyService.getCardTypeById(id, user.id);
    return result;
  }

  @Post('card-types')
  @ApiOperation({ summary: 'Tạo kiểu thẻ mới' })
  @SerializeOptions({ type: CardTypeWithFieldsDto, excludeExtraneousValues: true })
  async createCardType(
    @CurrentUser() user: RequestUser,
    @Body() createCardTypeDto: CreateCardTypeDto,
  ): Promise<CardTypeWithFieldsDto | null> {
    const result = await this.vocabularyService.createCardType(
      user.id,
      createCardTypeDto,
    );
    return result;
  }

  @Patch('card-types/:id')
  @ApiOperation({ summary: 'Cập nhật kiểu thẻ' })
  @SerializeOptions({ type: CardTypeWithFieldsDto, excludeExtraneousValues: true })
  async updateCardType(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: Partial<CreateCardTypeDto>,
  ): Promise<CardTypeWithFieldsDto | null> {
    const result = await this.vocabularyService.updateCardType(
      id,
      user.id,
      dto,
    );
    return result;
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
  @SerializeOptions({ type: CardDetailDto, excludeExtraneousValues: true })
  async getDueCards(
    @Param('id') collectionId: string,
    @CurrentUser() user: RequestUser,
  ): Promise<CardDetailDto[]> {
    const result = await this.vocabularyService.getDueCards(
      collectionId,
      user.id,
    );
    return result;
  }

  @Post('cards/:id/review')
  @ApiOperation({ summary: 'Đánh giá ôn tập thẻ theo SRS (SM-2)' })
  @SerializeOptions({ type: ReviewCardResponseDto, excludeExtraneousValues: true })
  async reviewCard(
    @Param('id') cardId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ReviewCardDto,
  ): Promise<ReviewCardResponseDto> {
    const result = await this.vocabularyService.reviewCard(
      cardId,
      user.id,
      dto.rating,
    );
    return result;
  }
}
