import { forwardRef, Module } from '@nestjs/common';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { AnkiImporterService } from './services/anki-importer.service';
import { UsersModule } from '../users/users.module';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [forwardRef(() => UsersModule), BlogModule],
  controllers: [VocabularyController],
  providers: [VocabularyService, AnkiImporterService],
  exports: [VocabularyService, AnkiImporterService],
})
export class VocabularyModule {}
