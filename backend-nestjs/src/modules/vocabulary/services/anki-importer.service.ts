import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import initSqlJs from 'sql.js';
import AdmZip from 'adm-zip';
import { CardSide } from '@prisma/client';

export interface AnkiImportResult {
  collectionId: string;
  collectionName: string;
  cardsCount: number;
  cardTypeName: string;
}

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'mp3':
      return 'audio/mpeg';
    case 'ogg':
      return 'audio/ogg';
    case 'wav':
      return 'audio/wav';
    case 'm4a':
      return 'audio/mp4';
    default:
      return 'application/octet-stream';
  }
}

function cleanHtmlTags(html: string): string {
  if (!html) return '';
  // Replace <br> and <div> with newlines
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '');

  // Decode basic HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return text.trim();
}

@Injectable()
export class AnkiImporterService {
  private readonly logger = new Logger(AnkiImporterService.name);

  constructor(private readonly prisma: PrismaService) {}

  async importAnkiPackage(
    fileBuffer: Buffer,
    userId: string,
    customCollectionName?: string,
  ): Promise<AnkiImportResult> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('Empty file provided');
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(fileBuffer);
    } catch (err) {
      this.logger.error('Failed to parse .apkg zip archive', err);
      throw new BadRequestException('Invalid .apkg archive file');
    }

    const zipEntries = zip.getEntries();

    // 1. Locate SQLite database (collection.anki2 or collection.anki21)
    let ankiDbEntry = zip.getEntry('collection.anki2');
    if (!ankiDbEntry) {
      ankiDbEntry = zip.getEntry('collection.anki21');
    }
    if (!ankiDbEntry) {
      for (const entry of zipEntries) {
        if (entry.entryName.startsWith('collection.anki')) {
          ankiDbEntry = entry;
          break;
        }
      }
    }

    if (!ankiDbEntry) {
      throw new BadRequestException('Invalid Anki package: collection database not found');
    }

    // 2. Extract media map (media JSON file)
    const mediaMap: Record<string, string> = {}; // realFilename -> dataUri
    const mediaEntry = zip.getEntry('media');
    if (mediaEntry) {
      try {
        const mediaJsonStr = mediaEntry.getData().toString('utf8');
        const mediaEntries = JSON.parse(mediaJsonStr) as Record<string, string>;

        for (const [key, realFileName] of Object.entries(mediaEntries)) {
          const assetEntry = zip.getEntry(key);
          if (assetEntry) {
            const assetBuffer = assetEntry.getData();
            const mimeType = getMimeType(realFileName);
            const base64 = assetBuffer.toString('base64');
            mediaMap[realFileName] = `data:${mimeType};base64,${base64}`;
          }
        }
      } catch (err) {
        this.logger.warn('Failed to parse media mapping in Anki package', err);
      }
    }

    // 3. Initialize SQLite WASM engine
    const SQL = await initSqlJs();
    const dbData = new Uint8Array(ankiDbEntry.getData());
    const db = new SQL.Database(dbData);

    try {
      // 4. Read metadata from col table
      const colQuery = db.exec('SELECT models, decks FROM col LIMIT 1');
      if (!colQuery.length || !colQuery[0].values.length) {
        throw new BadRequestException('Could not read Anki collection metadata');
      }

      const [modelsJson, decksJson] = colQuery[0].values[0] as [string, string];
      const models = JSON.parse(modelsJson);
      const decks = JSON.parse(decksJson);

      // Determine collection name from deck
      let deckName = customCollectionName?.trim() || '';
      if (!deckName) {
        // Find first non-default deck name
        const deckEntries = Object.values(decks) as Array<{ id: number; name: string }>;
        const nonDefaultDeck = deckEntries.find((d) => d.name && d.name !== 'Default');
        deckName = nonDefaultDeck ? nonDefaultDeck.name : deckEntries[0]?.name || 'Anki Deck';
      }

      // Ensure unique collection name for user
      const existingCol = await this.prisma.cardCollection.findFirst({
        where: { name: deckName },
      });
      let finalCollectionName = deckName;
      if (existingCol) {
        finalCollectionName = `${deckName} (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`;
      }

      // 5. Read notes and cards
      const notesQuery = db.exec('SELECT id, mid, flds, tags FROM notes');
      if (!notesQuery.length || !notesQuery[0].values.length) {
        throw new BadRequestException('No flashcard notes found in this Anki package');
      }

      const notesRows = notesQuery[0].values as Array<[number, number, string, string]>;

      // 6. Map models to CardTypes
      // For each model in Anki, create a CardType in VocaLab if not exists
      const modelMap = new Map<number, any>();
      for (const [modelIdStr, modelObj] of Object.entries(models)) {
        modelMap.set(Number(modelIdStr), modelObj);
      }

      // Pick the primary model (used by most notes)
      const modelCounts: Record<number, number> = {};
      for (const [, mid] of notesRows) {
        modelCounts[mid] = (modelCounts[mid] || 0) + 1;
      }
      const primaryMid = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const primaryModel = modelMap.get(Number(primaryMid)) || Object.values(models)[0];

      if (!primaryModel || !primaryModel.flds) {
        throw new BadRequestException('No valid note type model found in Anki package');
      }

      // Determine front/back field sides from model tmpls
      const frontFieldNames = new Set<string>();
      if (primaryModel.tmpls && Array.isArray(primaryModel.tmpls)) {
        for (const tmpl of primaryModel.tmpls) {
          const qfmt = tmpl.qfmt || '';
          for (const fld of primaryModel.flds) {
            if (qfmt.includes(`{{${fld.name}}}`) || qfmt.includes(`{{#${fld.name}}}`)) {
              frontFieldNames.add(fld.name);
            }
          }
        }
      }

      // If no front fields detected, default first field to FRONT, rest to BACK
      if (frontFieldNames.size === 0 && primaryModel.flds.length > 0) {
        frontFieldNames.add(primaryModel.flds[0].name);
      }

      // Create CardType in Prisma
      const cardTypeName = `Anki - ${primaryModel.name || finalCollectionName}`;
      let uniqueCardTypeName = cardTypeName;
      const existingCardType = await this.prisma.cardType.findFirst({
        where: { userId, name: cardTypeName },
      });
      if (existingCardType) {
        uniqueCardTypeName = `${cardTypeName} (${Date.now().toString().slice(-4)})`;
      }

      const createdCardType = await this.prisma.cardType.create({
        data: {
          name: uniqueCardTypeName,
          description: `Imported from Anki note type: ${primaryModel.name}`,
          userId,
          fields: {
            create: (primaryModel.flds as Array<{ name: string; ord: number }>).map((fld, idx) => ({
              key: `field_${fld.ord ?? idx}`,
              label: fld.name,
              order: fld.ord ?? idx,
              side: frontFieldNames.has(fld.name) ? CardSide.FRONT : CardSide.BACK,
            })),
          },
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });

      // 7. Create CardCollection
      const createdCollection = await this.prisma.cardCollection.create({
        data: {
          name: finalCollectionName,
          description: `Imported from Anki (${notesRows.length} cards)`,
          userId,
          isPublic: true,
        },
      });

      // 8. Helper to resolve embedded media in field values
      const resolveFieldMedia = (rawVal: string): string => {
        if (!rawVal) return '';

        let resolved = rawVal;

        // Replace <img src="filename.ext"> with Data URLs
        resolved = resolved.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (match, fileName) => {
          const dataUrl = mediaMap[fileName] || mediaMap[decodeURIComponent(fileName)];
          if (dataUrl) {
            return `<img src="${dataUrl}" />`;
          }
          return match;
        });

        // Replace [sound:filename.ext]
        resolved = resolved.replace(/\[sound:([^\]]+)\]/gi, (match, fileName) => {
          const dataUrl = mediaMap[fileName] || mediaMap[decodeURIComponent(fileName)];
          if (dataUrl) {
            return `\n${dataUrl}`;
          }
          return '';
        });

        // If the entire field is just an HTML img tag, extract the src cleanly
        const singleImgMatch = resolved.trim().match(/^<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>$/i);
        if (singleImgMatch) {
          return singleImgMatch[1];
        }

        // Clean HTML formatting tags
        return cleanHtmlTags(resolved);
      };

      // 9. Batch create Cards and CardFieldValues
      const cardsToCreate: Array<{
        position: number;
        values: Array<{ fieldId: string; value: string }>;
      }> = [];

      for (let i = 0; i < notesRows.length; i++) {
        const [, , fldsStr] = notesRows[i];
        const fieldValues = fldsStr.split('\x1f'); // ASCII Unit Separator

        const cardFieldValues: Array<{ fieldId: string; value: string }> = [];
        for (let fIdx = 0; fIdx < createdCardType.fields.length; fIdx++) {
          const fieldDef = createdCardType.fields[fIdx];
          const rawVal = fieldValues[fIdx] || '';
          const resolvedVal = resolveFieldMedia(rawVal);

          if (resolvedVal.trim().length > 0) {
            cardFieldValues.push({
              fieldId: fieldDef.id,
              value: resolvedVal.trim(),
            });
          }
        }

        // Only create cards that have at least one field value
        if (cardFieldValues.length > 0) {
          cardsToCreate.push({
            position: i,
            values: cardFieldValues,
          });
        }
      }

      // Execute in transactions for large decks
      let totalCreated = 0;
      const CHUNK_SIZE = 50;
      for (let c = 0; c < cardsToCreate.length; c += CHUNK_SIZE) {
        const chunk = cardsToCreate.slice(c, c + CHUNK_SIZE);
        await this.prisma.$transaction(
          chunk.map((item) =>
            this.prisma.card.create({
              data: {
                cardTypeId: createdCardType.id,
                cardCollectionId: createdCollection.id,
                position: item.position,
                values: {
                  create: item.values,
                },
              },
            }),
          ),
        );
        totalCreated += chunk.length;
      }

      return {
        collectionId: createdCollection.id,
        collectionName: createdCollection.name,
        cardsCount: totalCreated,
        cardTypeName: createdCardType.name,
      };
    } finally {
      db.close();
    }
  }
}
