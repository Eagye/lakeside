import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroImageEntity } from './hero-image.entity';
import { HeroImageService } from './hero-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([HeroImageEntity])],
  providers: [HeroImageService],
  exports: [HeroImageService],
})
export class HeroImageModule {}
