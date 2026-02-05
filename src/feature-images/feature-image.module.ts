import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureImageEntity } from './feature-image.entity';
import { FeatureImageService } from './feature-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureImageEntity])],
  providers: [FeatureImageService],
  exports: [FeatureImageService],
})
export class FeatureImageModule {}
