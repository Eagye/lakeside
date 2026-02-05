import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenhouseVideoEntity } from './greenhouse-video.entity';
import { GreenhouseVideoService } from './greenhouse-video.service';

@Module({
  imports: [TypeOrmModule.forFeature([GreenhouseVideoEntity])],
  providers: [GreenhouseVideoService],
  exports: [GreenhouseVideoService],
})
export class GreenhouseVideoModule {}
