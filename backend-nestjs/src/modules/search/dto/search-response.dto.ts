import { Expose, Type } from 'class-transformer';
import { GroupSearchItemDto } from '@/modules/group-chat/dto/group-chat-response.dto';
import {  UserSummaryDto } from '@/modules/users/dto/users-response.dto';
import { CollectionSearchItemDto } from '@/modules/vocabulary/dto/vocabulary-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSuggestionResultResponse {
  @ApiProperty({ description: 'The unique identifier of the suggestion' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'The display text of the suggestion' })
  @Expose()
  text!: string;
}
export class SidebarSearchResultResponse {
  @ApiProperty({
    description: 'Collections search results',
    type: [CollectionSearchItemDto],
  })
  @Expose()
  @Type(() => CollectionSearchItemDto)
  collections!: CollectionSearchItemDto[];

  @ApiProperty({
    description: 'Groups search results',
    type: [GroupSearchItemDto],
  })
  @Expose()
  @Type(() => GroupSearchItemDto)
  groups!: GroupSearchItemDto[];

  @ApiProperty({
    description: 'Profiles search results',
    type: [UserSummaryDto],
  })
  @Expose()
  @Type(() => UserSummaryDto)
  profiles!: UserSummaryDto[];
}
