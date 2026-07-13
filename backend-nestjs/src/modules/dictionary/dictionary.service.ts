import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildDictionaryApiUrl } from '@/common/utils/dictionary.utils';
import { firstValueFrom } from 'rxjs';
import { DictionaryLookupResponse } from './dto/dictionary.dto';

import { 
  MwEntry, 
  MwDef, 
  MwDro, 
  MwDtItem, 
  MwSenseTuple, 
  MwSseqArray, 
  MwThesaurusEntry 
} from './interfaces/merriam-webster.interface';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getSuggestions(query: string) {
    if (!query || query.length < 2) return [];
    const normalizedQuery = query.trim();

    // lookups
    const url = buildDictionaryApiUrl(
      this.configService.get<string>('MW_BASE_URL'),
      this.configService.get<string>('MW_DICT_API_KEY'),
      normalizedQuery,
      'learners',
    );

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      if (typeof data[0] === 'string') {
        // Spelling suggestions
        return data.slice(0, 10).map((word: string, index: number) => ({
          id: `sugg-${index}`,
          text: word,
        }));
      }

      // Exact matches (take stems from the first few definitions)
      const suggestions = new Set<string>();
      data.slice(0, 5).forEach((entry: MwEntry) => {
        if (entry.meta && entry.meta.stems) {
          entry.meta.stems
            .slice(0, 3)
            .forEach((stem: string) => suggestions.add(stem));
        }
      });

      return Array.from(suggestions).map((text, index) => ({
        id: `stem-${index}`,
        text,
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error fetching dictionary suggestions: ${errorMessage}`,
      );
      return [];
    }
  }

  async lookupWord(word: string): Promise<DictionaryLookupResponse | null> {
    if (!word) return null;
    const normalizedWord = word.trim();

    const dictUrl = buildDictionaryApiUrl(
      this.configService.get<string>('MW_BASE_URL'),
      this.configService.get<string>('MW_DICT_API_KEY'),
      normalizedWord,
      'learners',
    );

    const thesaurusUrl = buildDictionaryApiUrl(
      this.configService.get<string>('MW_BASE_URL'),
      this.configService.get<string>('MW_THESAURUS_API_KEY'),
      normalizedWord,
      'thesaurus',
    );

    try {
      const [dictRes, thesaurusRes] = await Promise.all([
        firstValueFrom(this.httpService.get(dictUrl)).catch(() => ({ data: [] })),
        firstValueFrom(this.httpService.get(thesaurusUrl)).catch(() => ({ data: [] }))
      ]);

      const dictData = dictRes.data;
      const thesaurusData = thesaurusRes.data;

      if (!Array.isArray(dictData) || dictData.length === 0 || typeof dictData[0] === 'string') {
        // Not found or spelling suggestions only
        return null;
      }

      // Parse the first exact match entry from learners
      const entry = dictData[0] as MwEntry;
      const hw = entry.hwi?.hw?.replace(/\*/g, '') || normalizedWord;
      const phonetic = entry.hwi?.prs?.[0]?.ipa || '';
      const audioUrl = this.parseAudioUrl(entry.hwi?.prs?.[0]?.sound?.audio);
      
      const meanings = this.parseMeanings(dictData, hw);
      const idioms = this.parseIdioms(dictData, hw);
      const { synonyms, antonyms } = this.parseThesaurus(thesaurusData);

      return {
        word: hw,
        phonetic,
        audioUrl,
        meanings,
        idioms,
        synonyms,
        antonyms,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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

  private parseDtTokens(dt: MwDtItem[]): { text: string; examples: string[] } {
    let text = '';
    const examples: string[] = [];
    if (!Array.isArray(dt)) return { text, examples };

    dt.forEach((dtItem: MwDtItem) => {
      if (dtItem[0] === 'text') {
        text += this.cleanMwText(dtItem[1] as string) + ' ';
      } else if (dtItem[0] === 'vis') {
        (dtItem[1] as { t: string }[]).forEach((visItem) => {
          if (visItem.t) {
            examples.push(this.cleanMwText(visItem.t));
          }
        });
      } else if (dtItem[0] === 'snote') {
        const snoteData = dtItem[1];
        if (Array.isArray(snoteData) && snoteData[0] && snoteData[0][0] === 't') {
          text += this.cleanMwText(snoteData[0][1]) + ' ';
        }
      }
    });

    return { text: text.trim(), examples };
  }

  private parseMeanings(dictData: MwEntry[], hw: string) {
    const meanings: { partOfSpeech: string; definitions: { text: string; examples: string[] }[] }[] = [];

    for (const e of dictData) {
      const currentHw = e.hwi?.hw?.replace(/\*/g, '');
      if (currentHw && currentHw.toLowerCase() !== hw.toLowerCase()) continue;

      const partOfSpeech = e.fl || 'unknown';
      const definitions: { text: string; examples: string[] }[] = [];

      if (e.def && Array.isArray(e.def)) {
        e.def.forEach((d: MwDef) => {
          if (d.sseq && Array.isArray(d.sseq)) {
            d.sseq.forEach((sseqItem: MwSseqArray) => {
              sseqItem.forEach((senseItem: MwSenseTuple) => {
                if (senseItem[0] === 'sense' || senseItem[0] === 'pseq') {
                  const dt = senseItem[1]?.dt;
                  if (dt) {
                    const parsed = this.parseDtTokens(dt);
                    if (parsed.text) definitions.push(parsed);
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

  private parseIdioms(dictData: MwEntry[], hw: string) {
    const idioms: { phrase: string; definitions: { text: string; examples: string[] }[] }[] = [];

    for (const e of dictData) {
      const currentHw = e.hwi?.hw?.replace(/\*/g, '');
      if (currentHw && currentHw.toLowerCase() !== hw.toLowerCase()) continue;

      if (e.dros && Array.isArray(e.dros)) {
        e.dros.forEach((dro: MwDro) => {
          if (!dro.drp) return;
          const phrase = this.cleanMwText(dro.drp);
          const phraseDefs: { text: string; examples: string[] }[] = [];
          
          if (dro.def && Array.isArray(dro.def)) {
            dro.def.forEach((d: MwDef) => {
              if (d.sseq && Array.isArray(d.sseq)) {
                d.sseq.forEach((sseqItem: MwSseqArray) => {
                  sseqItem.forEach((senseItem: MwSenseTuple) => {
                    if (senseItem[0] === 'sense') {
                      const dt = senseItem[1]?.dt;
                      if (dt) {
                        const parsed = this.parseDtTokens(dt);
                        if (parsed.text) phraseDefs.push(parsed);
                      }
                    }
                  });
                });
              }
            });
          }
          if (phraseDefs.length > 0) {
            idioms.push({ phrase, definitions: phraseDefs });
          }
        });
      }
    }
    return idioms;
  }

  private parseThesaurus(thesaurusData: MwThesaurusEntry[]) {
    const synonyms = new Set<string>();
    const antonyms = new Set<string>();
    
    if (Array.isArray(thesaurusData) && thesaurusData.length > 0 && typeof thesaurusData[0] !== 'string') {
      const thesaurusEntry = thesaurusData[0];
      
      if (thesaurusEntry.meta?.syns && Array.isArray(thesaurusEntry.meta.syns)) {
        thesaurusEntry.meta.syns.forEach((synGroup: string[]) => {
          synGroup.forEach((syn: string) => synonyms.add(syn));
        });
      }
      
      if (thesaurusEntry.meta?.ants && Array.isArray(thesaurusEntry.meta.ants)) {
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
      .replace(/{it}/g, '') // italics
      .replace(/{\/it}/g, '')
      .replace(/{phrase}/g, '')
      .replace(/{\/phrase}/g, '')
      .replace(/{b}/g, '')
      .replace(/{\/b}/g, '')
      .replace(/{inf}/g, '')
      .replace(/{\/inf}/g, '')
      .replace(/{wi}/g, '')
      .replace(/{\/wi}/g, '')
      .replace(/{p_only}.*?{\/p_only}/g, '') 
      .replace(/{dx}.*?{\/dx}/g, '') 
      .replace(/{dxt\|.*?\|\|}/g, '') 
      .replace(/\{[^}]+\}/g, '') // catch-all for remaining tags
      .trim();
  }
}
