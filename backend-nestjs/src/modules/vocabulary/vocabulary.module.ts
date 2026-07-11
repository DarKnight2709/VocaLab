import { forwardRef, Module } from '@nestjs/common';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { UsersModule } from '../users/users.module';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [forwardRef(() => UsersModule), BlogModule],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
