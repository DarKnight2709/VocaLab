import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { VocabularyModule } from '../vocabulary/vocabulary.module';
import { BlogModule } from '../blog/blog.module';
import { GroupChatModule } from '../group-chat/group-chat.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    VocabularyModule,
    BlogModule,
    GroupChatModule,
    UsersModule
  ],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
