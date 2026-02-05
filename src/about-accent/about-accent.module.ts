import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutAccentImage } from './about-accent-image.entity';
import { AboutAccentService } from './about-accent.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutAccentImage])],
  providers: [AboutAccentService],
  exports: [AboutAccentService],
})
export class AboutAccentModule {}
