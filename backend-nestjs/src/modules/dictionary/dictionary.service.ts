import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildDictionaryApiUrl } from '@/common/utils/dictionary.utils';
import { firstValueFrom } from 'rxjs';
import { DictionaryLookupResponse } from './dto/dictionary.dto';
import { RedisService } from '@/core/cache/redis.service';
import { ZodError, ZodType, z } from 'zod';
import {
  LearnerDictionaryEntry,
  LearnerDictionaryEntrySchema,
  DefiningTextTuple,
  Definition,
  SenseSequence,
  DefinedRunOn,
  UsageNote,
} from './validation/LearnerDictionaryEntrySchema';
import {
  ThesaurusEntry,
  ThesaurusEntrySchema,
} from './validation/ThesaurusEntrySchema';
import { SearchSuggestionResultResponse } from '../search/dto/search.dto';
import { validateWithSchema } from '@/common/validation/validate-schema';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject()
    private readonly redisService: RedisService,
  ) {}

  async getSuggestions(
    query: string,
  ): Promise<SearchSuggestionResultResponse[]> {
    if (!query || query.length < 2) return [];
    const normalizedQuery = query.trim();

    // lookups
    const url = buildDictionaryApiUrl(
      this.configService.get<string>('MW_BASE_URL') || '',
      this.configService.get<string>('MW_DICT_API_KEY') || '',
      normalizedQuery,
      'learners',
    );

    try {
      const key = `suggestion:${normalizedQuery}`;
      const cachedValue = await this.redisService.getCache<string[]>(key);
      if (cachedValue) {
        return cachedValue.slice(0, 10).map((word: string, index: number) => ({
          id: `sugg-${index}`,
          text: word,
        }));
      }
      const { data } = await firstValueFrom(this.httpService.get(url));
      const validatedData = validateWithSchema(
        data,
        LearnerDictionaryEntrySchema,
      );

      // Exact matches (take stems from the first few definitions)
      const suggestions = new Set<string>();
      validatedData.slice(0, 5).forEach((entry) => {
        if (entry.meta && entry.meta.stems) {
          entry.meta.stems
            .slice(0, 3)
            .forEach((stem: string) => suggestions.add(stem));
        }
      });

      await this.redisService.setCache(key, Array.from(suggestions));

      return Array.from(suggestions).map((text, index) => ({
        id: `stem-${index}`,
        text,
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error fetching dictionary suggestions: ${errorMessage}`,
      );
      return [];
    }
  }

  async lookupWord(word: string): Promise<DictionaryLookupResponse | null> {
    if (!word) return null;
    const normalizedWord = word.trim();

    const key = `dict:word:${normalizedWord}`;
    const cachedValue =
      await this.redisService.getCache<DictionaryLookupResponse>(key);
    if (cachedValue) {
      return cachedValue;
    }
    const dictUrl = buildDictionaryApiUrl(
      this.configService.get<string>('MW_BASE_URL') || '',
      this.configService.get<string>('MW_DICT_API_KEY') || '',
      normalizedWord,
      'learners',
    );

    const thesaurusUrl = buildDictionaryApiUrl(
      this.configService.get<string>('MW_BASE_URL') || '',
      this.configService.get<string>('MW_THESAURUS_API_KEY') || '',
      normalizedWord,
      'thesaurus',
    );

    try {
      const [dictRes, thesaurusRes] = await Promise.all([
        firstValueFrom(this.httpService.get(dictUrl)).catch(() => ({
          data: [],
        })),
        firstValueFrom(this.httpService.get(thesaurusUrl)).catch(() => ({
          data: [],
        })),
      ]);

      const dictData = dictRes.data;
      const thesaurusData = thesaurusRes.data;

      const validatedDictData = validateWithSchema(
        dictData,
        LearnerDictionaryEntrySchema,
      );
      const validatedThesaurusData = validateWithSchema(
        thesaurusData,
        ThesaurusEntrySchema,
      );

      // Parse the first exact match entry from learners
      const entry = validatedDictData[0];
      const syllabicWord = entry.hwi?.hw || '';
      const hw = syllabicWord.replace(/\*/g, '') || normalizedWord;

      const isOffensive = entry.meta?.offensive ?? false;
      const stems = entry.meta?.stems || [];

      const pronunciations = (entry.hwi?.prs || []).map((pr) => ({
        phonetic: pr.ipa || null,
        audioUrl: pr.sound?.audio ? this.parseAudioUrl(pr.sound.audio) : null,
      }));

      const inflections = (entry.ins || []).map((inf) => ({
        label: inf.il || null,
        value: inf.if || null,
      }));

      const relatedWords = stems.filter(
        (s) => s.toLowerCase() !== hw.toLowerCase(),
      );

      const meanings = this.parseMeanings(validatedDictData, hw);
      const idioms = this.parseIdioms(validatedDictData, hw);
      const { synonyms, antonyms } = this.parseThesaurus(
        validatedThesaurusData,
      );

      const refinedWordData = {
        word: hw,
        isOffensive,
        stems,
        pronunciations,
        inflections,
        meanings,
        idioms,
        synonyms,
        antonyms,
        relatedWords,
      };

      await this.redisService.setCache<DictionaryLookupResponse>(key, refinedWordData);

      return refinedWordData;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error looking up dictionary word: ${errorMessage}`);
      return null;
    }
  }

  private parseAudioUrl(audioKey?: string): string {
    if (!audioKey) return '';
    let subdir = audioKey.charAt(0);
    if (audioKey.startsWith('bix')) subdir = 'bix';
    else if (audioKey.startsWith('gg')) subdir = 'gg';
    else if (audioKey.match(/^[^a-zA-Z]/)) subdir = 'number';
    return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audioKey}.mp3`;
  }

  private parseDtTokens(dt: DefiningTextTuple[]): {
    text: string;
    examples: string[];
    grammar: string | null;
    isUsageNote?: boolean;
  }[] {
    const results: { text: string; examples: string[]; grammar: string | null; isUsageNote?: boolean }[] = [];
    let current = { text: '', examples: [] as string[], grammar: null as string | null, isUsageNote: false };

    const processItem = (item: DefiningTextTuple) => {
      if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
        const type = item[0];
        const value = item[1];
        
        if (type === 'text' && typeof value === 'string') {
          current.text += this.cleanMwText(value) + ' ';
        } else if (type === 'wsgram' && typeof value === 'string') {
          if (current.grammar) {
            if (!current.grammar.includes(value)) {
              current.grammar += `, ${value}`;
            }
          } else {
            current.grammar = value;
          }
        } else if (type === 'vis' && Array.isArray(value)) {
          (value as { t: string }[]).forEach((visItem: { t: string }) => {
            if (visItem && typeof visItem.t === 'string') {
              current.examples.push(this.cleanMwText(visItem.t));
            }
          });
        } else if (type === 'snote' && Array.isArray(value)) {
          (value as UsageNote[]).forEach((noteItem: UsageNote) => {
            if (Array.isArray(noteItem) && noteItem.length >= 2) {
              if (noteItem[0] === 't' && typeof noteItem[1] === 'string') {
                current.text += this.cleanMwText(noteItem[1]) + ' ';
              } else if (noteItem[0] === 'vis' && Array.isArray(noteItem[1])) {
                (noteItem[1] as { t: string }[]).forEach((visItem: { t: string }) => {
                  if (visItem && typeof visItem.t === 'string') {
                    current.examples.push(this.cleanMwText(visItem.t));
                  }
                });
              }
            }
          });
        } else if (type === 'uns' && Array.isArray(value)) {
          if (current.text || current.examples.length > 0) {
            current.text = current.text.trim();
            results.push({ ...current });
            current = { text: '', examples: [], grammar: null, isUsageNote: true };
          } else {
            current.isUsageNote = true;
          }

          (value as DefiningTextTuple[][]).forEach((outerArr: DefiningTextTuple[]) => {
            if (Array.isArray(outerArr)) {
              outerArr.forEach((innerItem: DefiningTextTuple) => {
                processItem(innerItem);
              });
              
              if (current.text || current.examples.length > 0) {
                current.text = current.text.trim();
                results.push({ ...current });
                current = { text: '', examples: [], grammar: null, isUsageNote: true }; // any subsequent ones are also usage notes
              }
            }
          });
          // Reset to normal definition mode after uns? Actually uns is usually at the end, but let's reset it just in case.
          current.isUsageNote = false;
        }
      }
    };

    if (Array.isArray(dt)) {
      dt.forEach((item) => {
        processItem(item);
      });
    }

    current.text = current.text.trim();
    if (current.text || current.examples.length > 0) {
      results.push(current);
    }

    return results;
  }

  private parseMeanings(dictData: LearnerDictionaryEntry, hw: string) {
    const meanings: {
      partOfSpeech: string | null;
      definitions: {
        text: string | null;
        examples: string[];
      }[];
    }[] = [];

    for (const e of dictData) {
      const currentHw = e.hwi?.hw?.replace(/\*/g, '');
      if (currentHw && currentHw.toLowerCase() !== hw.toLowerCase()) continue;

      const partOfSpeech = e.fl || null;
      const rootGrammar = e.gram || null;
      const definitions: {
        text: string | null;
        examples: string[];
      }[] = [];

      if (e.def && Array.isArray(e.def)) {
        e.def.forEach((d: Definition) => {
          if (d.sseq && Array.isArray(d.sseq)) {
            d.sseq.forEach((sseqItem: SenseSequence[]) => {
              sseqItem.forEach((senseItem: SenseSequence) => {
                if (senseItem[0] === 'sense') {
                  const sense = senseItem[1];
                  const dt = sense?.dt;
                  const sgram = sense?.sgram || null;
                  const lbs = sense?.lbs?.join(', ') || null;

                  if (dt) {
                    const parsedArray = this.parseDtTokens(dt);
                    parsedArray.forEach(parsed => {
                      if (parsed.text) {
                        const dtGrammar = parsed.grammar;
                        const slsLabels = sense?.sls?.join(', ') || null;
                        const grammarTokens = parsed.isUsageNote
                          ? [dtGrammar, slsLabels].filter(Boolean)
                          : [rootGrammar, sgram, dtGrammar, lbs, slsLabels].filter(Boolean);
                          
                        const finalGrammar =
                          grammarTokens.length > 0
                            ? `<span class="italic text-muted-foreground mr-2 font-normal">[${grammarTokens.join(', ')}]</span> `
                            : '';

                        definitions.push({
                          text: finalGrammar + parsed.text,
                          examples: parsed.examples,
                        });
                      }
                    });
                  }
                }
              });
            });
          }
        });
      }

      if (definitions.length > 0) {
        meanings.push({ partOfSpeech, definitions });
      }
    }
    return meanings;
  }

  private parseIdioms(dictData: LearnerDictionaryEntry, hw: string) {
    const idioms: {
      isPhrasalVerb: boolean;
      phrase: string | null;
      definitions: {
        text: string | null;
        examples: string[];
      }[];
    }[] = [];

    for (const e of dictData) {
      const currentHw = e.hwi?.hw?.replace(/\*/g, '');
      if (currentHw && currentHw.toLowerCase() !== hw.toLowerCase()) continue;
      const rootGrammar = e.gram || null;

      // 1. Extract from Defined Run-Ons (dros)
      if (e.dros && Array.isArray(e.dros)) {
        e.dros.forEach((dro: DefinedRunOn) => {
          if (!dro.drp) return;
          const phrase = this.cleanMwText(dro.drp) || null;
          const isPhrasalVerb = dro.gram === 'phrasal verb';
          const phraseDefs: {
            text: string | null;
            examples: string[];
          }[] = [];

          if (dro.def && Array.isArray(dro.def)) {
            dro.def.forEach((d: Definition) => {
              if (d.sseq && Array.isArray(d.sseq)) {
                d.sseq.forEach((sseqItem: SenseSequence[]) => {
                  sseqItem.forEach((senseItem: SenseSequence) => {
                    if (senseItem[0] === 'sense') {
                      const sense = senseItem[1];
                      const dt = sense?.dt;
                      const sgram = sense?.sgram || null;
                      const lbs = sense?.lbs?.join(', ') || null;

                      if (dt) {
                        const parsedArray = this.parseDtTokens(dt);
                        parsedArray.forEach(parsed => {
                          if (parsed.text) {
                            const dtGrammar = parsed.grammar;
                            const slsLabels = sense?.sls?.join(', ') || null;
                            const grammarTokens = parsed.isUsageNote
                              ? [dtGrammar, slsLabels].filter(Boolean)
                              : [rootGrammar, sgram, dtGrammar, lbs, slsLabels].filter(Boolean);
                              
                            const finalGrammar =
                              grammarTokens.length > 0
                                ? `<span class="italic text-muted-foreground mr-2 font-normal">[${grammarTokens.join(', ')}]</span> `
                                : '';

                            phraseDefs.push({
                              text: finalGrammar + parsed.text,
                              examples: parsed.examples,
                            });
                          }
                        });
                      }
                    }
                  });
                });
              }
            });
          }
          if (phraseDefs.length > 0) {
            idioms.push({ isPhrasalVerb, phrase, definitions: phraseDefs });
          }
        });
      }

      // 2. Extract from Senses with sphrasev (phrase variants)
      if (e.def && Array.isArray(e.def)) {
        e.def.forEach((d: Definition) => {
          if (d.sseq && Array.isArray(d.sseq)) {
            d.sseq.forEach((sseqItem: SenseSequence[]) => {
              sseqItem.forEach((senseItem: SenseSequence) => {
                if (senseItem[0] === 'sense') {
                  const sense = senseItem[1];
                  const sphrasev = sense?.sphrasev;
                  if (sphrasev && sphrasev.phrs && sphrasev.phrs.length > 0) {
                    const dt = sense?.dt;
                    const sls = sense?.sls || [];
                    const isPhrasalVerb = sls.includes('phrasal verb');
                    const sgram = sense?.sgram || null;
                    const lbs = sense?.lbs?.join(', ') || null;

                    const phraseDefs: {
                      text: string | null;
                      examples: string[];
                    }[] = [];

                    if (dt) {
                      const parsedArray = this.parseDtTokens(dt);
                      parsedArray.forEach(parsed => {
                        if (parsed.text) {
                          const dtGrammar = parsed.grammar;
                          const slsLabels = sense?.sls?.join(', ') || null;
                          const grammarTokens = [
                            rootGrammar,
                            sgram,
                            dtGrammar,
                            lbs,
                            slsLabels,
                          ].filter(Boolean);
                          const finalGrammar =
                            grammarTokens.length > 0
                              ? `<span class="italic text-muted-foreground mr-2 font-normal">[${grammarTokens.join(', ')}]</span> `
                              : '';

                          phraseDefs.push({
                            text: finalGrammar + parsed.text,
                            examples: parsed.examples,
                          });
                        }
                      });
                    }

                    if (phraseDefs.length > 0) {
                      sphrasev.phrs.forEach(phr => {
                        const phrase = this.cleanMwText(phr.pva) || null;
                        if (phrase) {
                          idioms.push({ isPhrasalVerb, phrase, definitions: phraseDefs });
                        }
                      });
                    }
                  }
                }
              });
            });
          }
        });
      }
    }
    return idioms;
  }

  private parseThesaurus(thesaurusData: ThesaurusEntry) {
    const synonyms = new Set<string>();
    const antonyms = new Set<string>();

    if (
      Array.isArray(thesaurusData) &&
      thesaurusData.length > 0 &&
      typeof thesaurusData[0] !== 'string'
    ) {
      const thesaurusEntry = thesaurusData[0];

      if (
        thesaurusEntry.meta?.syns &&
        Array.isArray(thesaurusEntry.meta.syns)
      ) {
        thesaurusEntry.meta.syns.forEach((synGroup: string[]) => {
          synGroup.forEach((syn: string) => synonyms.add(syn));
        });
      }

      if (
        thesaurusEntry.meta?.ants &&
        Array.isArray(thesaurusEntry.meta.ants)
      ) {
        thesaurusEntry.meta.ants.forEach((antGroup: string[]) => {
          antGroup.forEach((ant: string) => antonyms.add(ant));
        });
      }
    }

    return {
      synonyms: Array.from(synonyms).slice(0, 15),
      antonyms: Array.from(antonyms).slice(0, 15),
    };
  }

  private cleanMwText(text: string): string {
    if (!text) return '';
    return text
      .replace(/{bc}/g, '') // bold colon
      .replace(/{it}/g, '<strong class="text-primary font-semibold">')
      .replace(/{\/it}/g, '</strong>')
      .replace(/{phrase}/g, '<strong class="text-primary font-semibold">')
      .replace(/{\/phrase}/g, '</strong>')
      .replace(/{b}/g, '<strong class="text-primary font-semibold">')
      .replace(/{\/b}/g, '</strong>')
      .replace(/{inf}/g, '<strong class="text-primary font-semibold">')
      .replace(/{\/inf}/g, '</strong>')
      .replace(/{wi}/g, '<strong class="text-primary font-semibold">')
      .replace(/{\/wi}/g, '</strong>')
      .replace(/\{(?:sx|dxt|mat)\|([^|}]+).*?\}/g, '$1') // Extract cross-reference words like {sx|automobile||}
      .replace(/\{(?:a_link|d_link|i_link|et_link)\|([^|}]+)\}/g, '$1') // Extract link words
      .replace(/{p_only}.*?{\/p_only}/g, '')
      .replace(/{dx}.*?{\/dx}/g, '')
      .replace(/\{[^}]+\}/g, '') // catch-all for remaining tags
      .trim();
  }
}
