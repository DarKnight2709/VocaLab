import { ApiProperty } from '@nestjs/swagger';

export class SearchSuggestionResultResponse {
  @ApiProperty({ description: 'The unique identifier of the suggestion' })
  id!: string;

  @ApiProperty({ description: 'The display text of the suggestion' })
  text!: string;
}
