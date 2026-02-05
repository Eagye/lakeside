import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { HeroImageModule } from '../hero-images/hero-image.module';
import { OfferModule } from '../offers/offer.module';
import { TestimonialModule } from '../testimonials/testimonial.module';
import { TeamModule } from '../team/team.module';
import { AboutImageModule } from '../about-images/about-image.module';
import { AboutIntroImageModule } from '../about-intro-images/about-intro-image.module';
import { FeatureImageModule } from '../feature-images/feature-image.module';
import { ServicesModule } from '../services/services.module';
import { GreenhouseVideoModule } from '../greenhouse-video/greenhouse-video.module';
import { AboutAccentModule } from '../about-accent/about-accent.module';
import { NewsModule } from '../news/news.module';
import { BranchModule } from '../branches/branch.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminSessionEntity } from './admin-session.entity';
import { AdminUserEntity } from './admin-user.entity';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    ContentModule,
    HeroImageModule,
    OfferModule,
    TestimonialModule,
    TeamModule,
    AboutImageModule,
    AboutIntroImageModule,
    FeatureImageModule,
    ServicesModule,
    GreenhouseVideoModule,
    AboutAccentModule,
    NewsModule,
    BranchModule,
    TypeOrmModule.forFeature([AdminUserEntity, AdminSessionEntity]),
  ],
  controllers: [AdminAuthController, AdminController],
  providers: [AdminAuthService],
})
export class AdminModule {}
