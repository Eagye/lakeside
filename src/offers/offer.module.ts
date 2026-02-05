import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferCardEntity } from './offer-card.entity';
import { OfferImageEntity } from './offer-image.entity';
import { OfferService } from './offer.service';

@Module({
  imports: [TypeOrmModule.forFeature([OfferCardEntity, OfferImageEntity])],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
