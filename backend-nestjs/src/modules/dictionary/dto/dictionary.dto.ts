import { ApiProperty } from '@nestjs/swagger';

export class DictionaryDefinitionDto {
  @ApiProperty()
  text!: string;

  @ApiProperty({ type: [String] })
  examples!: string[];
}

export class DictionaryMeaningDto {
  @ApiProperty()
  partOfSpeech!: string;

  @ApiProperty({ type: [DictionaryDefinitionDto] })
  definitions!: DictionaryDefinitionDto[];
}

export class DictionaryIdiomDto {
  @ApiProperty()
  phrase!: string;

  @ApiProperty({ type: [DictionaryDefinitionDto] })
  definitions!: DictionaryDefinitionDto[];
}

export class DictionaryLookupResponse {
  @ApiProperty()
  word!: string;

  @ApiProperty()
  phonetic!: string;

  @ApiProperty()
  audioUrl!: string;

  @ApiProperty({ type: [DictionaryMeaningDto] })
  meanings!: DictionaryMeaningDto[];

  @ApiProperty({ type: [DictionaryIdiomDto] })
  idioms!: DictionaryIdiomDto[];

  @ApiProperty({ type: [String] })
  synonyms!: string[];

  @ApiProperty({ type: [String] })
  antonyms!: string[];
}
