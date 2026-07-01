import { GroupSearchItemDto } from '@/modules/group-chat/dto/group-chat-response.dto';
import { GetGroupsResponseDto } from '@/modules/messages/dto/messages-response.dto';
import { UserResponse, UserSummaryDto } from '@/modules/users/dto/users-response.dto';
import { CollectionSearchItemDto } from '@/modules/vocabulary/dto/vocabulary-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSuggestionResultResponse {
  @ApiProperty({ description: 'The unique identifier of the suggestion' })
  id!: string;

  @ApiProperty({ description: 'The display text of the suggestion' })
  text!: string;
}
export class SidebarSearchResultResponse {
  @ApiProperty({
    description: 'Collections search results',
    type: [CollectionSearchItemDto],
  })
  collections!: CollectionSearchItemDto[];

  @ApiProperty({
    description: 'Groups search results',
    type: [GroupSearchItemDto],
  })
  groups!: GroupSearchItemDto[];

  @ApiProperty({
    description: 'Profiles search results',
    type: [UserSummaryDto],
  })
  profiles!: UserSummaryDto[];
}
