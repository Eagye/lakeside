import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutImageEntity } from './about-image.entity';
import { AboutImageService } from './about-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutImageEntity])],
  providers: [AboutImageService],
  exports: [AboutImageService],
})
export class AboutImageModule {}
