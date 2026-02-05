import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutIntroImageEntity } from './about-intro-image.entity';
import { AboutIntroImageService } from './about-intro-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutIntroImageEntity])],
  providers: [AboutIntroImageService],
  exports: [AboutIntroImageService],
})
export class AboutIntroImageModule {}
