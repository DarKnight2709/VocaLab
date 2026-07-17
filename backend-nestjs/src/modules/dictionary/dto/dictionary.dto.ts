import { ApiPropertyOptional } from '@nestjs/swagger';

export class DictionaryDefinitionDto {
  @ApiPropertyOptional({
    description: 'The actual definition text',
    example:
      "used to attract someone's attention or to express surprise, joy, or anger",
    nullable: true,
  })
  text!: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Examples of the word in context',
    example: ['Hey, wait for me!'],
  })
  examples: string[] = [];
}

export class DictionaryMeaningDto {
  @ApiPropertyOptional({
    description: 'Functional label for this specific meaning block',
    example: 'interjection',
    nullable: true,
  })
  partOfSpeech!: string | null;

  @ApiPropertyOptional({
    type: [DictionaryDefinitionDto],
  })
  definitions: DictionaryDefinitionDto[] = [];
}

export class DictionaryIdiomDto {
  @ApiPropertyOptional({
    description: 'Whether this phrase is a phrasal verb or an idiom',
    example: true,
  })
  isPhrasalVerb!: boolean;

  @ApiPropertyOptional({
    description: 'The idiomatic phrase',
    example: 'upset the apple cart',
    nullable: true,
  })
  phrase!: string | null;

  @ApiPropertyOptional({
    type: [DictionaryDefinitionDto],
  })
  definitions: DictionaryDefinitionDto[] = [];
}

export class InflectionDto {
  @ApiPropertyOptional({
    description: 'Inflection label (e.g., plural, past tense)',
    example: 'plural',
    nullable: true,
  })
  label!: string | null;

  @ApiPropertyOptional({
    description: 'The inflected form of the word',
    example: 'apples',
    nullable: true,
  })
  value!: string | null;
}

export class PronunciationDto {
  @ApiPropertyOptional({
    description: 'The IPA phonetic spelling',
    example: 'ˈheɪ',
    nullable: true,
  })
  phonetic!: string | null;

  @ApiPropertyOptional({
    description: 'Direct URL to the playable mp3 file',
    example:
      'https://media.merriam-webster.com/audio/prons/en/us/mp3/h/hey00001.mp3',
    nullable: true,
  })
  audioUrl!: string | null;
}

export class DictionaryLookupResponse {
  @ApiPropertyOptional({
    description: 'The headword being defined',
    example: 'hey',
    nullable: true,
  })
  word!: string | null;

  @ApiPropertyOptional({
    description:
      'Whether the word is considered offensive or profane (useful for content filtering)',
    example: false,
    nullable: true,
  })
  isOffensive!: boolean | null;

  @ApiPropertyOptional({
    type: [String],
    description:
      'All morphological stems of the word for backend search indexing',
    example: ['hey'],
  })
  stems: string[] = [];

  @ApiPropertyOptional({
    type: [PronunciationDto],
    description:
      'List of pronunciations (handles words with multiple valid pronunciations)',
  })
  pronunciations: PronunciationDto[] = [];

  @ApiPropertyOptional({
    type: [InflectionDto],
    description: 'Morphological inflections like plurals or past participles',
  })
  inflections: InflectionDto[] = [];

  @ApiPropertyOptional({
    type: [DictionaryMeaningDto],
    description: 'Detailed definitions grouped by part of speech',
  })
  meanings: DictionaryMeaningDto[] = [];

  @ApiPropertyOptional({
    type: [DictionaryIdiomDto],
    description: 'Idioms and run-on phrases associated with the word',
  })
  idioms: DictionaryIdiomDto[] = [];

  @ApiPropertyOptional({
    type: [String],
    description: 'Direct synonyms from the Thesaurus API',
  })
  synonyms: string[] = [];

  @ApiPropertyOptional({
    type: [String],
    description: 'Direct antonyms from the Thesaurus API',
  })
  antonyms: string[] = [];

  @ApiPropertyOptional({
    type: [String],
    description:
      'Words conceptually related to the headword, but not direct synonyms',
  })
  relatedWords: string[] = [];
}
