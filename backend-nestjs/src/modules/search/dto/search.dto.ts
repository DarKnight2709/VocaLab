import { ApiProperty } from '@nestjs/swagger';

export class SearchSuggestionResultResponse {
  @ApiProperty({ description: 'The unique identifier of the suggestion' })
  id!: string;

  @ApiProperty({ description: 'The display text of the suggestion' })
  text!: string;
}
// export class SidebarSearchResultResponse {
//   @ApiProperty({
//     description: 'Collections search results',
//     type: CollectionsSearchResultResponse,
//   })
//   collections!: CollectionSearchItemDto[];

//   @ApiProperty({
//     description: 'Groups search results',
//     type: [GetGroupsResponseDto],
//   })
//   groups!: GetGroupsResponseDto[];

//   @ApiProperty({
//     description: 'Profiles search results',
//     type: [PublicUserDto],
//   })
//   profiles!: PublicUserDto[];
// }
