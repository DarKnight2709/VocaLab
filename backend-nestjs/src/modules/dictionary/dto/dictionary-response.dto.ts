import { Expose, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DictionaryDefinitionDto {
  @ApiPropertyOptional({
    description: 'The actual definition text',
    example:
      "used to attract someone's attention or to express surprise, joy, or anger",
    nullable: true,
  })
  @Expose()
  text!: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Examples of the word in context',
    example: ['Hey, wait for me!'],
  })
  @Expose()
  examples: string[] = [];
}

export class DictionaryMeaningDto {
  @ApiPropertyOptional({
    description: 'Functional label for this specific meaning block',
    example: 'interjection',
    nullable: true,
  })
  @Expose()
  partOfSpeech!: string | null;

  @ApiPropertyOptional({
    type: [DictionaryDefinitionDto],
  })
  @Expose()
  @Type(() => DictionaryDefinitionDto)
  definitions: DictionaryDefinitionDto[] = [];
}

export class DictionaryIdiomDto {
  @ApiPropertyOptional({
    description: 'Whether this phrase is a phrasal verb or an idiom',
    example: true,
  })
  @Expose()
  isPhrasalVerb!: boolean;

  @ApiPropertyOptional({
    description: 'The idiomatic phrase',
    example: 'upset the apple cart',
    nullable: true,
  })
  @Expose()
  phrase!: string | null;

  @ApiPropertyOptional({
    type: [DictionaryDefinitionDto],
  })
  @Expose()
  @Type(() => DictionaryDefinitionDto)
  definitions: DictionaryDefinitionDto[] = [];
}

export class InflectionDto {
  @ApiPropertyOptional({
    description: 'Inflection label (e.g., plural, past tense)',
    example: 'plural',
    nullable: true,
  })
  @Expose()
  label!: string | null;

  @ApiPropertyOptional({
    description: 'The inflected form of the word',
    example: 'apples',
    nullable: true,
  })
  @Expose()
  value!: string | null;
}

export class PronunciationDto {
  @ApiPropertyOptional({
    description: 'The IPA phonetic spelling',
    example: 'ˈheɪ',
    nullable: true,
  })
  @Expose()
  phonetic!: string | null;

  @ApiPropertyOptional({
    description: 'Direct URL to the playable mp3 file',
    example:
      'https://media.merriam-webster.com/audio/prons/en/us/mp3/h/hey00001.mp3',
    nullable: true,
  })
  @Expose()
  audioUrl!: string | null;
}

export class DictionaryLookupResponse {
  @ApiPropertyOptional({
    description: 'The headword being defined',
    example: 'hey',
    nullable: true,
  })
  @Expose()
  word!: string | null;

  @ApiPropertyOptional({
    description:
      'Whether the word is considered offensive or profane (useful for content filtering)',
    example: false,
    nullable: true,
  })
  @Expose()
  isOffensive!: boolean | null;

  @ApiPropertyOptional({
    type: [String],
    description:
      'All morphological stems of the word for backend search indexing',
    example: ['hey'],
  })
  @Expose()
  stems: string[] = [];

  @ApiPropertyOptional({
    type: [PronunciationDto],
    description:
      'List of pronunciations (handles words with multiple valid pronunciations)',
  })
  @Expose()
  @Type(() => PronunciationDto)
  pronunciations: PronunciationDto[] = [];

  @ApiPropertyOptional({
    type: [InflectionDto],
    description: 'Morphological inflections like plurals or past participles',
  })
  @Expose()
  @Type(() => InflectionDto)
  inflections: InflectionDto[] = [];

  @ApiPropertyOptional({
    type: [DictionaryMeaningDto],
    description: 'Detailed definitions grouped by part of speech',
  })
  @Expose()
  @Type(() => DictionaryMeaningDto)
  meanings: DictionaryMeaningDto[] = [];

  @ApiPropertyOptional({
    type: [DictionaryIdiomDto],
    description: 'Idioms and run-on phrases associated with the word',
  })
  @Expose()
  @Type(() => DictionaryIdiomDto)
  idioms: DictionaryIdiomDto[] = [];

  @ApiPropertyOptional({
    type: [String],
    description: 'Direct synonyms from the Thesaurus API',
  })
  @Expose()
  synonyms: string[] = [];

  @ApiPropertyOptional({
    type: [String],
    description: 'Direct antonyms from the Thesaurus API',
  })
  @Expose()
  antonyms: string[] = [];

  @ApiPropertyOptional({
    type: [String],
    description:
      'Words conceptually related to the headword, but not direct synonyms',
  })
  @Expose()
  relatedWords: string[] = [];
}
