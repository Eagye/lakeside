import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentEntity } from './content.entity';
import { SiteContent } from './content.types';

@Injectable()
export class ContentService implements OnModuleInit {
  private readonly defaultContent: SiteContent = {
    home: {
      heroEyebrow: 'WELCOME TO LAKESIDE FARMS',
      heroTitle: 'Cultivating Excellence in Sustainable Agriculture',
      heroSubtitle:
        'Nourishing Ghana\'s agricultural future with integrity and innovation. We cultivate the land, care for livestock, and craft quality feed to support thriving farms across the nation.',
      heroCta: 'Discover More',
    },
    about: {
      eyebrow: 'WHY CHOOSE US',
      title: 'Agri-business across crops, livestock, and poultry',
      summary:
        'We grow crops, rear livestock and poultry, and produce animal feed, while supporting local supply through agricultural trade from our Accra base.',
    },
    updatedAt: new Date().toISOString(),
  };

  constructor(
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureSeeded();
  }

  async getContent(): Promise<SiteContent> {
    const entity = await this.ensureSeeded();
    return this.toSiteContent(entity);
  }

  async getPublicContent(): Promise<SiteContent> {
    return this.getContent();
  }

  async updateContent(partial: Partial<SiteContent>): Promise<SiteContent> {
    const entity = await this.ensureSeeded();
    const now = new Date().toISOString();
    const updated: ContentEntity = {
      ...entity,
      ...partial,
      home: {
        ...entity.home,
        ...(partial.home ?? {}),
      },
      about: {
        ...entity.about,
        ...(partial.about ?? {}),
      },
      updatedAt: now,
    };
    const saved = await this.contentRepository.save(updated);
    return this.toSiteContent(saved);
  }

  private async ensureSeeded(): Promise<ContentEntity> {
    const existing = await this.contentRepository.findOne({
      where: { id: 1 },
    });
    if (existing) {
      return existing;
    }
    const seed = this.contentRepository.create({
      id: 1,
      home: this.defaultContent.home,
      about: this.defaultContent.about,
      updatedAt: this.defaultContent.updatedAt,
    });
    return this.contentRepository.save(seed);
  }

  private toSiteContent(entity: ContentEntity): SiteContent {
    return {
      home: entity.home,
      about: entity.about,
      updatedAt: entity.updatedAt,
    };
  }
}
