import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialEntity } from './testimonial.entity';
import { TestimonialService } from './testimonial.service';

@Module({
  imports: [TypeOrmModule.forFeature([TestimonialEntity])],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}
