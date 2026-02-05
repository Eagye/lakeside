import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsEntity } from './news.entity';
import { NewsImageEntity } from './news-image.entity';
import { NewsService } from './news.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity, NewsImageEntity])],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
