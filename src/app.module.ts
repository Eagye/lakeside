import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { EmailService } from './common/email.service';
import { AdminSessionEntity } from './admin/admin-session.entity';
import { AdminUserEntity } from './admin/admin-user.entity';
import { ContentEntity } from './content/content.entity';
import { ContentModule } from './content/content.module';
import { HeroImageEntity } from './hero-images/hero-image.entity';
import { HeroImageModule } from './hero-images/hero-image.module';
import { OfferCardEntity } from './offers/offer-card.entity';
import { OfferImageEntity } from './offers/offer-image.entity';
import { OfferModule } from './offers/offer.module';
import { TestimonialEntity } from './testimonials/testimonial.entity';
import { TestimonialModule } from './testimonials/testimonial.module';
import { TeamMemberEntity } from './team/team-member.entity';
import { TeamModule } from './team/team.module';
import { AboutImageEntity } from './about-images/about-image.entity';
import { AboutImageModule } from './about-images/about-image.module';
import { AboutIntroImageEntity } from './about-intro-images/about-intro-image.entity';
import { AboutIntroImageModule } from './about-intro-images/about-intro-image.module';
import { FeatureImageEntity } from './feature-images/feature-image.entity';
import { FeatureImageModule } from './feature-images/feature-image.module';
import { ServiceCategoryEntity } from './services/services-category.entity';
import { ServiceCategoryImageEntity } from './services/services-category-image.entity';
import { ServiceProductEntity } from './services/services-product.entity';
import { ServicesModule } from './services/services.module';
import { GreenhouseVideoEntity } from './greenhouse-video/greenhouse-video.entity';
import { GreenhouseVideoModule } from './greenhouse-video/greenhouse-video.module';
import { AboutAccentImage } from './about-accent/about-accent-image.entity';
import { AboutAccentModule } from './about-accent/about-accent.module';
import { NewsEntity } from './news/news.entity';
import { NewsImageEntity } from './news/news-image.entity';
import { NewsModule } from './news/news.module';
import { BranchEntity } from './branches/branch.entity';
import { BranchModule } from './branches/branch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL?.startsWith('postgres')
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [
              ContentEntity,
              AdminUserEntity,
              AdminSessionEntity,
              HeroImageEntity,
              OfferCardEntity,
              OfferImageEntity,
              TestimonialEntity,
              TeamMemberEntity,
              AboutImageEntity,
              AboutIntroImageEntity,
              FeatureImageEntity,
              ServiceCategoryEntity,
              ServiceCategoryImageEntity,
              ServiceProductEntity,
              GreenhouseVideoEntity,
              AboutAccentImage,
              NewsEntity,
              NewsImageEntity,
              BranchEntity,
            ],
            synchronize: true,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          }
        : {
            type: 'sqlite',
            database: process.env.DB_PATH || 'lakeside.sqlite',
            entities: [
              ContentEntity,
              AdminUserEntity,
              AdminSessionEntity,
              HeroImageEntity,
              OfferCardEntity,
              OfferImageEntity,
              TestimonialEntity,
              TeamMemberEntity,
              AboutImageEntity,
              AboutIntroImageEntity,
              FeatureImageEntity,
              ServiceCategoryEntity,
              ServiceCategoryImageEntity,
              ServiceProductEntity,
              GreenhouseVideoEntity,
              AboutAccentImage,
              NewsEntity,
              NewsImageEntity,
              BranchEntity,
            ],
            synchronize: true,
          },
    ),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60, limit: 100 }],
    }),
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
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    EmailService,
  ],
})
export class AppModule {}
