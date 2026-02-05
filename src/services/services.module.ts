import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoryEntity } from './services-category.entity';
import { ServiceCategoryImageEntity } from './services-category-image.entity';
import { ServiceProductEntity } from './services-product.entity';
import { ServicesService } from './services.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceCategoryEntity,
      ServiceCategoryImageEntity,
      ServiceProductEntity,
    ]),
  ],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
